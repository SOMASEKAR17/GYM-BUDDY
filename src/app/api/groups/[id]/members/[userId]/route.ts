import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; userId: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id, userId } = await params;

        const group = await prisma.group.findUnique({ where: { id } });
        if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

        if (group.leaderId !== user.id) {
            return NextResponse.json({ error: "Only the leader can remove members" }, { status: 403 });
        }

        if (group.leaderId === userId) {
            return NextResponse.json({ error: "Leader cannot be removed. Transfer leadership first." }, { status: 400 });
        }

        await prisma.groupMember.delete({
            where: { userId } // Since userId is unique in GroupMember
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Remove Member Error:", error);
        return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
    }
}
