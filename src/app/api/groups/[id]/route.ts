import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const group = await prisma.group.findUnique({
            where: { id },
            include: {
                leader: { select: { id: true, name: true, profileImage: true } },
                members: {
                    include: {
                        user: { select: { id: true, name: true, profileImage: true } }
                    }
                },
                _count: { select: { members: true } }
            }
        });

        if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

        const user = await getCurrentUser();
        let userRole: string | null = null;
        let hasRequested = false;

        if (user) {
            const membership = await prisma.groupMember.findFirst({
                where: { groupId: id, userId: user.id }
            });
            userRole = membership?.role || null;

            if (!membership) {
                const request = await prisma.joinRequest.findFirst({
                    where: { groupId: id, userId: user.id, status: "PENDING" }
                });
                hasRequested = !!request;
            }
        }

        return NextResponse.json({
            group,
            userRole,
            hasRequested
        });
    } catch (error) {
        console.error("GET Group Details Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const group = await prisma.group.findUnique({ where: { id } });
        if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

        if (group.leaderId !== user.id) {
            return NextResponse.json({ error: "Only the leader can edit group info" }, { status: 403 });
        }

        const body = await req.json();
        const updated = await prisma.group.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description,
                rules: body.rules,
                minimumRequirements: body.minimumRequirements,
                maxMembers: body.maxMembers ? parseInt(body.maxMembers) : undefined,
                privacyType: body.privacyType,
            }
        });

        return NextResponse.json({ group: updated });
    } catch (error) {
        console.error("PATCH Group Error:", error);
        return NextResponse.json({ error: "Failed to update group" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const group = await prisma.group.findUnique({ where: { id } });
        if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

        if (group.leaderId !== user.id) {
            return NextResponse.json({ error: "Only the leader can delete the group" }, { status: 403 });
        }

        await prisma.group.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE Group Error:", error);
        return NextResponse.json({ error: "Failed to delete group" }, { status: 500 });
    }
}
