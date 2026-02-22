/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateCompatibility } from "@/lib/compatibility";

export async function GET(req: NextRequest) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const url = new URL(req.url);
        const limit = parseInt(url.searchParams.get("limit") || "10");

        // Get users already swiped on
        const swiped = await prisma.swipe.findMany({
            where: { fromUserId: user.id },
            select: { toUserId: true },
        });

        const swipedIds: string[] = (swiped as any[]).map((s) => s.toUserId as string);
        swipedIds.push(user.id);

        const currentUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { gender: true, gymLocation: true }
        });

        const isUserOutside = currentUser?.gymLocation?.includes("(Outside)");

        // Base filter
        const whereClause: any = {
            id: { notIn: swipedIds },
            questionnaire: { isNot: null },
        };

        // Matching logic
        if (isUserOutside) {
            whereClause.OR = [
                { gender: currentUser?.gender },
                { gymLocation: { contains: "(Outside)" } }
            ];
        } else {
            whereClause.gender = currentUser?.gender;
        }

        const candidates = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                age: true,
                gender: true,
                bio: true,
                gymLocation: true,
                fitnessLevel: true,
                fitnessGoal: true,
                profileImage: true,
                course: true,
                year: true,
                questionnaire: true,
            },
            take: limit * 3,
        });

        // Score and sort candidates
        const fullUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: { questionnaire: true },
        });

        const scored = (candidates as any[])
            .map((c) => ({
                ...c,
                compatibilityScore: calculateCompatibility(
                    {
                        gymLocation: fullUser?.gymLocation,
                        fitnessGoal: fullUser?.fitnessGoal,
                        fitnessLevel: fullUser?.fitnessLevel,
                        questionnaire: fullUser?.questionnaire,
                    },
                    {
                        gymLocation: c.gymLocation,
                        fitnessGoal: c.fitnessGoal,
                        fitnessLevel: c.fitnessLevel,
                        questionnaire: c.questionnaire,
                    }
                ),
            }))
            .sort((a: any, b: any) => b.compatibilityScore - a.compatibilityScore)
            .slice(0, limit);

        return NextResponse.json({ candidates: scored });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
