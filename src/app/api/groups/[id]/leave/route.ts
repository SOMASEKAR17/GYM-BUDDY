import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        const membership = await prisma.groupMember.findUnique({
            where: { userId: user.id }
        });

        if (!membership || membership.groupId !== id) {
            return NextResponse.json({ error: "You are not a member of this group" }, { status: 400 });
        }

        const memberCount = await prisma.groupMember.count({
            where: { groupId: id }
        });

        if (membership.role === "LEADER" && memberCount > 1) {
            return NextResponse.json({
                error: "Leaders cannot leave while there are other members. Transfer leadership first or delete the group."
            }, { status: 400 });
        }

        await prisma.$transaction(async (tx) => {
            await tx.groupMember.delete({
                where: { userId: user.id }
            });

            await tx.pr.updateMany({
                where: { userId: user.id, groupId: id },
                data: { groupId: null }
            });

            // Check if group is now empty
            const remainingMembers = await tx.groupMember.count({
                where: { groupId: id }
            });

            if (remainingMembers === 0) {
                await tx.group.delete({
                    where: { id }
                });
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Leave Group Error:", error);
        return NextResponse.json({ error: "Failed to leave group" }, { status: 500 });
    }
}
