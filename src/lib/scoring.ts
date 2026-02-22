import { prisma } from "./prisma";
import { subDays } from "date-fns";

export async function calculateGroupScores() {
    const groups = await prisma.group.findMany({
        include: {
            members: {
                include: { user: true }
            },
            prs: {
                where: {
                    createdAt: {
                        gte: subDays(new Date(), 7)
                    }
                },
                include: {
                    endorsements: true,
                    user: true
                }
            }
        }
    });

    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);

    for (const group of groups) {
        // 1. Consistency Score (35%)
        const prsByDay = new Set();
        group.prs.forEach(pr => {
            if (pr.status === 'VERIFIED') {
                prsByDay.add(pr.createdAt.toISOString().split('T')[0]);
            }
        });

        const activeDaysLast7 = prsByDay.size;
        const restGraceDays = 2;
        const effectiveActiveDays = Math.min(activeDaysLast7 + restGraceDays, 7);
        let consistencyScore = (effectiveActiveDays / 7) * 100;

        if (activeDaysLast7 <= 3) {
            const inactivityPenalty = (3 - activeDaysLast7) * 5;
            consistencyScore = Math.max(0, consistencyScore - inactivityPenalty);
        }

        // 2. Participation Score (25%)
        const totalMembers = group.members.length;
        const activeMembersCount = new Set(group.prs.filter(p => p.status === 'VERIFIED').map(p => p.userId)).size;
        let participationScore = totalMembers > 0 ? (activeMembersCount / totalMembers) * 100 : 0;

        if (totalMembers < 3) {
            participationScore = Math.min(participationScore, 80);
        }

        // 3. Growth Score (25%)
        let growthScore = 0;
        const verifiedPrs = group.prs.filter(p => p.status === 'VERIFIED');
        if (verifiedPrs.length > 0) {
            let totalImprovement = 0;
            let improvementCount = 0;

            for (const pr of verifiedPrs) {
                // Find previous best PR for this user and exercise
                const prevBest = await prisma.pr.findFirst({
                    where: {
                        userId: pr.userId,
                        exerciseName: pr.exerciseName,
                        status: 'VERIFIED',
                        createdAt: { lt: pr.createdAt }
                    },
                    orderBy: { weight: 'desc' }
                });

                if (prevBest && prevBest.weight > 0) {
                    let imp = ((pr.weight - prevBest.weight) / prevBest.weight) * 100;
                    if (imp > 0) {
                        imp = Math.min(imp, 15); // Cap at 15%
                        totalImprovement += imp;
                        improvementCount++;
                    }
                }
            }

            const averageImprovement = improvementCount > 0 ? totalImprovement / improvementCount : 0;
            growthScore = Math.min(averageImprovement * 5, 100);
        }

        // 4. Verification Quality Score (15%)
        const totalSubmitted = group.prs.length;
        const totalVerified = verifiedPrs.length;
        let verificationQualityScore = totalSubmitted > 0 ? (totalVerified / totalSubmitted) * 100 : 100;

        // Suspicion Penalty
        let totalEndorsementTime = 0;
        let endorsementCount = 0;
        for (const pr of group.prs) {
            for (const endo of pr.endorsements) {
                const diffMs = endo.createdAt.getTime() - pr.createdAt.getTime();
                totalEndorsementTime += diffMs;
                endorsementCount++;
            }
        }

        const avgEndorsementTimeMin = endorsementCount > 0 ? (totalEndorsementTime / endorsementCount) / (1000 * 60) : 10;
        if (avgEndorsementTimeMin < 2) {
            verificationQualityScore = Math.max(0, verificationQualityScore - 10);
        }

        // Final Calculation
        let finalScore = (0.35 * (consistencyScore || 0)) +
            (0.25 * (participationScore || 0)) +
            (0.25 * (growthScore || 0)) +
            (0.15 * (verificationQualityScore || 0));

        // Decay Mechanism
        // Check if no PR for 3 consecutive days
        const lastPr = await prisma.pr.findFirst({
            where: { groupId: group.id },
            orderBy: { createdAt: 'desc' }
        });

        if (lastPr) {
            const inactiveDays = Math.floor((now.getTime() - lastPr.createdAt.getTime()) / (1000 * 60 * 60 * 24));
            if (inactiveDays > 3) {
                const inactiveDaysBeyond2 = inactiveDays - 2;
                const decayFactor = 1 - (0.03 * inactiveDaysBeyond2);
                finalScore = finalScore * Math.max(0, decayFactor);
            }
        } else {
            // No PRs at all
            const ageInDays = Math.floor((now.getTime() - group.createdAt.getTime()) / (1000 * 60 * 60 * 24));
            if (ageInDays > 3) {
                finalScore = 0;
            }
        }

        finalScore = Math.min(100, Math.max(0, finalScore || 0));

        // Update Group
        const currentScore = Number((group as any).overallScore) || 0;
        await prisma.group.update({
            where: { id: group.id },
            data: {
                previousScore: currentScore,
                overallScore: finalScore,
                dailyDelta: finalScore - currentScore
            }
        });
    }

    console.log("Leaderboard scores recalculated successfully.");
}
