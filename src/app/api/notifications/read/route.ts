import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let notificationId = undefined;
        try {
            const body = await req.json();
            notificationId = body.notificationId;
        } catch {
            // Optional body
        }

        if (notificationId) {
            // Delete specific notification
            await prisma.notification.delete({
                where: { id: notificationId, userId: user.id },
            });
        } else {
            // Delete all read notifications (or all if clearing)
            await prisma.notification.deleteMany({
                where: { userId: user.id },
            });
        }

        return NextResponse.json({ message: "Notifications marked as read" });
    } catch (error) {
        console.error("Mark Read error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
