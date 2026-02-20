import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendPushNotification } from "@/lib/notifications";

const schema = z.object({
    toUserId: z.string(),
    liked: z.boolean(),
});

export async function POST(req: NextRequest) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        const { toUserId, liked } = parsed.data;

        // Create swipe
        await prisma.swipe.upsert({
            where: { fromUserId_toUserId: { fromUserId: user.id, toUserId } },
            create: { fromUserId: user.id, toUserId, liked },
            update: { liked },
        });

        // Check for mutual match
        let matched = false;
        if (liked) {
            const reverseSwipe = await prisma.swipe.findFirst({
                where: { fromUserId: toUserId, toUserId: user.id, liked: true },
            });

            if (reverseSwipe) {
                // Create match (ensure consistent ordering)
                const [u1, u2] = [user.id, toUserId].sort();
                const existingMatch = await prisma.match.findFirst({
                    where: { user1Id: u1, user2Id: u2 },
                });

                if (!existingMatch) {
                    await prisma.match.create({
                        data: { user1Id: u1, user2Id: u2 },
                    });

                    // Fetch users to get FCM tokens
                    const me = await prisma.user.findUnique({ where: { id: user.id }, select: { fcmToken: true } });
                    const target = await prisma.user.findUnique({ where: { id: toUserId }, select: { fcmToken: true, name: true } });

                    // Notify both users in DB
                    await prisma.notification.createMany({
                        data: [
                            { userId: user.id, type: "match", message: `You matched with ${target?.name}! 🎉` },
                            { userId: toUserId, type: "match", message: `You matched with ${user.name}! 🎉` },
                        ],
                    });

                    // Send Real-time Push Notifications
                    if (me?.fcmToken) {
                        await sendPushNotification(me.fcmToken, "New Match!", `You matched with ${target?.name}! 🎉`);
                    }
                    if (target?.fcmToken) {
                        await sendPushNotification(target.fcmToken, "New Match!", `You matched with ${user.name}! 🎉`);
                    }
                }
                matched = true;
            }
        }

        return NextResponse.json({ success: true, matched });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

