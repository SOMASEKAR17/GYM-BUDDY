import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ toUserId: z.string() });

export async function POST(req: NextRequest) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

        const { toUserId } = parsed.data;

        // Flip the existing skip swipe to a like
        await prisma.swipe.upsert({
            where: { fromUserId_toUserId: { fromUserId: user.id, toUserId } },
            create: { fromUserId: user.id, toUserId, liked: true },
            update: { liked: true },
        });

        // Check for mutual match
        let matched = false;
        const reverseSwipe = await prisma.swipe.findFirst({
            where: { fromUserId: toUserId, toUserId: user.id, liked: true },
        });

        if (reverseSwipe) {
            const [u1, u2] = [user.id, toUserId].sort();
            const existingMatch = await prisma.match.findFirst({
                where: { user1Id: u1, user2Id: u2 },
            });

            if (!existingMatch) {
                await prisma.match.create({ data: { user1Id: u1, user2Id: u2 } });
                await prisma.notification.createMany({
                    data: [
                        { userId: user.id, type: "match", message: "You have a new gym partner match! 🎉" },
                        { userId: toUserId, type: "match", message: "You have a new gym partner match! 🎉" },
                    ],
                });
            }
            matched = true;
        }

        return NextResponse.json({ success: true, matched });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
