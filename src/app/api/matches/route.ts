import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const matches = await prisma.match.findMany({
            where: {
                OR: [{ user1Id: user.id }, { user2Id: user.id }],
                active: true,
            },
            include: {
                user1: {
                    select: { id: true, name: true, profileImage: true, gymLocation: true, fitnessGoal: true, fitnessLevel: true },
                },
                user2: {
                    select: { id: true, name: true, profileImage: true, gymLocation: true, fitnessGoal: true, fitnessLevel: true },
                },
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: { content: true, createdAt: true, seen: true, senderId: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Return partner info for each match
        const formatted = matches.map((m) => {
            const partner = m.user1Id === user.id ? m.user2 : m.user1;
            const lastMessage = m.messages[0] || null;
            const hasUnread = lastMessage && !lastMessage.seen && lastMessage.senderId !== user.id;
            return { matchId: m.id, partner, lastMessage, hasUnread, createdAt: m.createdAt };
        });

        return NextResponse.json({ matches: formatted });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

