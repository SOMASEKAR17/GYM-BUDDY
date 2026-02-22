import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
// Trigger rebuild after Prisma generate

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type"); // "leaderboard" or "list"

        if (type === "leaderboard") {
            // Recalculate scores to keep it fresh for the demo/dev
            // In production, this would be a real cron job
            const { calculateGroupScores } = await import("@/lib/scoring");
            await calculateGroupScores();

            const groups = await prisma.group.findMany({
                include: {
                    leader: { select: { name: true, profileImage: true } },
                    _count: { select: { members: true, prs: { where: { status: "VERIFIED" } } } }
                },
                orderBy: [
                    { overallScore: 'desc' },
                    { members: { _count: 'desc' } },
                    { createdAt: 'asc' }
                ],
                take: 10
            });

            return NextResponse.json({
                groups: groups.map(g => ({
                    id: g.id,
                    name: g.name,
                    leaderName: g.leader.name,
                    leaderImage: g.leader.profileImage,
                    memberCount: g._count.members,
                    verifiedPRs: g._count.prs,
                    performanceScore: Math.round(g.overallScore),
                    dailyDelta: g.dailyDelta,
                    previousScore: g.previousScore
                }))
            });
        }

        // Default: List all groups
        const groups = await prisma.group.findMany({
            include: {
                leader: { select: { name: true, profileImage: true } },
                _count: { select: { members: true } }
            }
        });

        return NextResponse.json({
            groups: groups.map(g => ({
                ...g,
                leaderName: g.leader.name,
                leaderImage: g.leader.profileImage,
                memberCount: g._count.members
            }))
        });
    } catch (error) {
        console.error("GET Groups Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Check if user is already in a group
        const existingMembership = await prisma.groupMember.findUnique({
            where: { userId: user.id }
        });
        if (existingMembership) {
            return NextResponse.json({ error: "You are already a member of a group. Leave it first to create a new one." }, { status: 400 });
        }

        const body = await req.json();
        const {
            name, description, gymLocation, minimumRequirements,
            rules, privacyType, maxMembers
        } = body;

        const group = await prisma.$transaction(async (tx) => {
            const g = await tx.group.create({
                data: {
                    name,
                    description,
                    leaderId: user.id,
                    gymLocation,
                    minimumRequirements,
                    rules,
                    privacyType,
                    maxMembers: parseInt(maxMembers) || 10,
                }
            });

            await tx.groupMember.create({
                data: {
                    groupId: g.id,
                    userId: user.id,
                    role: "LEADER"
                }
            });

            return g;
        });

        return NextResponse.json({ group });
    } catch (error) {
        console.error("POST Group Error:", error);
        return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
    }
}
