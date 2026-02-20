import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let fcmToken = null;
        try {
            const body = await req.json();
            fcmToken = body.fcmToken;
        } catch {
            return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
        }
        if (!fcmToken) {
            return NextResponse.json({ error: "fcmToken required" }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { fcmToken },
        });

        return NextResponse.json({ message: "Token saved" });
    } catch (error: any) {
        console.error("Save FCM Token error DETAILS:", {
            message: error.message,
            code: error.code,
            meta: error.meta,
            stack: error.stack
        });
        return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
    }
}
