import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Individual leaderboard based on verified PR count
        const individuals = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                profileImage: true,
                course: true,
                year: true,
                _count: {
                    select: {
                        prs: {
                            where: { status: "VERIFIED" }
                        }
                    }
                }
            },
            orderBy: {
                prs: {
                    _count: "desc"
                }
            },
            take: 20
        });

        return NextResponse.json({
            users: individuals.map(u => ({
                id: u.id,
                name: u.name,
                image: u.profileImage,
                course: u.course,
                year: u.year,
                verifiedPRs: u._count.prs
            }))
        });
    } catch (error) {
        console.error("GET Individual Leaderboard Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
