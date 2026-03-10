import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const membership = await prisma.groupMember.findUnique({
            where: { userId: user.id },
            include: {
                group: {
                    include: {
                        leader: { select: { name: true } },
                        members: {
                            include: {
                                user: { select: { id: true, name: true, profileImage: true } }
                            }
                        },
                        prs: {
                            orderBy: { createdAt: 'desc' },
                            include: {
                                user: { select: { name: true } },
                                endorsements: true
                            }
                        }
                    }
                }
            }
        });

        if (!membership) return NextResponse.json({ group: null });

        return NextResponse.json({
            group: membership.group,
            role: membership.role
        });
    } catch (error) {
        console.error("GET My Group Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
