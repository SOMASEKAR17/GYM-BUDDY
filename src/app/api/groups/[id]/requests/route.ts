import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const group = await prisma.group.findUnique({ where: { id } });
        if (!group || group.leaderId !== user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const requests = await prisma.joinRequest.findMany({
            where: { groupId: id, status: "PENDING" },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profileImage: true,
                        fitnessLevel: true,
                        fitnessGoal: true,
                        bio: true,
                        age: true,
                        gymLocation: true,
                        course: true,
                        year: true,
                        _count: {
                            select: { prs: { where: { status: "VERIFIED" } } }
                        }
                    }
                }
            }
        });

        return NextResponse.json({ requests });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: groupId } = await params;
        const { requestId, status } = await req.json(); // status: "APPROVED" or "REJECTED"

        const group = await prisma.group.findUnique({ where: { id: groupId } });
        if (!group || group.leaderId !== user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const joinRequest = await prisma.joinRequest.findUnique({
            where: { id: requestId },
            include: { user: true }
        });

        if (!joinRequest || joinRequest.groupId !== groupId) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        if (status === "APPROVED") {
            // Check if group is full
            const memberCount = await prisma.groupMember.count({ where: { groupId } });
            if (memberCount >= group.maxMembers) {
                return NextResponse.json({ error: "Group is full" }, { status: 400 });
            }

            // Check if user is now in another group
            const otherMembership = await prisma.groupMember.findUnique({ where: { userId: joinRequest.userId } });
            if (otherMembership) {
                await prisma.joinRequest.update({ where: { id: requestId }, data: { status: "REJECTED" } });
                return NextResponse.json({ error: "User is already in another group" }, { status: 400 });
            }

            await prisma.$transaction([
                prisma.groupMember.create({
                    data: { groupId, userId: joinRequest.userId, role: "MEMBER" }
                }),
                prisma.joinRequest.update({
                    where: { id: requestId },
                    data: { status: "APPROVED" }
                }),
                // Reject all other pending requests for this user
                prisma.joinRequest.updateMany({
                    where: { userId: joinRequest.userId, status: "PENDING" },
                    data: { status: "REJECTED" }
                }),
                // Transfer user's PR history to the new group
                prisma.pr.updateMany({
                    where: { userId: joinRequest.userId },
                    data: { groupId }
                })
            ]);
        } else {
            await prisma.joinRequest.update({
                where: { id: requestId },
                data: { status: "REJECTED" }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Manage Request Error:", error);
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}
