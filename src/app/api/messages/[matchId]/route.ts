import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ content: z.string().min(1).max(2000) });

export async function GET(req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { matchId } = await params;

    try {
        // Verify user is part of this match
        const match = await prisma.match.findFirst({
            where: { id: matchId, OR: [{ user1Id: user.id }, { user2Id: user.id }] },
        });
        if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

        const messages = await prisma.message.findMany({
            where: { matchId },
            include: {
                sender: { select: { id: true, name: true, profileImage: true } },
            },
            orderBy: { createdAt: "asc" },
        });

        // Mark messages as seen
        await prisma.message.updateMany({
            where: { matchId, senderId: { not: user.id }, seen: false },
            data: { seen: true },
        });

        return NextResponse.json({ messages });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { matchId } = await params;

    try {
        const body = await req.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ error: "Invalid message" }, { status: 400 });

        const match = await prisma.match.findFirst({
            where: { id: matchId, OR: [{ user1Id: user.id }, { user2Id: user.id }] },
        });
        if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

        const message = await prisma.message.create({
            data: { matchId, senderId: user.id, content: parsed.data.content },
            include: { sender: { select: { id: true, name: true, profileImage: true } } },
        });

        // Notify the other user
        const otherId = match.user1Id === user.id ? match.user2Id : match.user1Id;
        await prisma.notification.create({
            data: {
                userId: otherId,
                type: "message",
                message: `${user.name} sent you a message`,
            },
        });

        return NextResponse.json({ message }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
