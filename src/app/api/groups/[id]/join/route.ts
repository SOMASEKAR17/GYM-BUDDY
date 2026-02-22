import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        // Check if user is already in a group
        const existingMembership = await prisma.groupMember.findUnique({
            where: { userId: user.id }
        });
        if (existingMembership) {
            return NextResponse.json({ error: "You are already in a group" }, { status: 400 });
        }

        // Check if group exists
        const group = await prisma.group.findUnique({
            where: { id },
            include: { _count: { select: { members: true } } }
        });
        if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

        if (group._count.members >= group.maxMembers) {
            return NextResponse.json({ error: "Group is full" }, { status: 400 });
        }

        // Check for existing request
        const existingRequest = await prisma.joinRequest.findFirst({
            where: { groupId: id, userId: user.id, status: "PENDING" }
        });
        if (existingRequest) {
            return NextResponse.json({ error: "Request already pending" }, { status: 400 });
        }

        if (group.privacyType === "PRIVATE") {
            return NextResponse.json({ error: "This group is private. You need an invite." }, { status: 403 });
        }

        const request = await prisma.joinRequest.create({
            data: {
                groupId: id,
                userId: user.id,
                status: "PENDING"
            }
        });

        return NextResponse.json({ request });
    } catch (error) {
        console.error("Join Group Error:", error);
        return NextResponse.json({ error: "Failed to request join" }, { status: 500 });
    }
}
