import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type"); // "leaderboard" or "list"

        if (type === "leaderboard") {
            // Basic leaderboard logic: Rank by total verified PRs
            const groups = await prisma.group.findMany({
                include: {
                    members: true,
                    leader: { select: { name: true } },
                    _count: {
                        select: {
                            prs: { where: { status: "VERIFIED" } }
                        }
                    }
                },
                orderBy: {
                    prs: {
                        _count: 'desc'
                    }
                },
                take: 5
            });

            return NextResponse.json({
                groups: groups.map(g => ({
                    id: g.id,
                    name: g.name,
                    leaderName: g.leader.name,
                    memberCount: g.members.length,
                    verifiedPRs: g._count.prs,
                    // Placeholder performance score: verified PRs * member count (bonus)
                    performanceScore: g._count.prs * 10
                }))
            });
        }

        // Default: List all groups
        const groups = await prisma.group.findMany({
            include: {
                _count: { select: { members: true } }
            }
        });

        return NextResponse.json({ groups });
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
