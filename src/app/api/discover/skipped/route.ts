/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateCompatibility } from "@/lib/compatibility";

export async function GET() {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        // Fetch all swipes where current user skipped (liked = false)
        const skippedSwipes = await prisma.swipe.findMany({
            where: { fromUserId: user.id, liked: false },
            include: {
                toUser: {
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
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Fetch current user's data for compatibility calc
        const fullUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: { questionnaire: true },
        });

        const profiles = (skippedSwipes as any[]).map((swipe) => ({
            swipeId: swipe.id,
            skippedAt: swipe.createdAt,
            ...swipe.toUser,
            compatibilityScore: calculateCompatibility(
                {
                    gymLocation: fullUser?.gymLocation,
                    fitnessGoal: fullUser?.fitnessGoal,
                    fitnessLevel: fullUser?.fitnessLevel,
                    questionnaire: fullUser?.questionnaire,
                },
                {
                    gymLocation: swipe.toUser.gymLocation,
                    fitnessGoal: swipe.toUser.fitnessGoal,
                    fitnessLevel: swipe.toUser.fitnessLevel,
                    questionnaire: swipe.toUser.questionnaire,
                }
            ),
        }));

        return NextResponse.json({ profiles });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
