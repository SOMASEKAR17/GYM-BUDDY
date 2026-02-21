import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { adminAuth } from "@/lib/fbAdmin";
import { z } from "zod";

const schema = z.object({
    idToken: z.string(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = schema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: "Authentication token required" }, { status: 400 });
        }

        const { idToken } = parsed.data;

        // Verify Firebase Token
        let decodedToken;
        try {
            decodedToken = await adminAuth.verifyIdToken(idToken);
        } catch (err) {
            console.error("Firebase token verification failed:", err);
            return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 });
        }

        const email = decodedToken.email;
        if (!email) {
            return NextResponse.json({ error: "Email not found in token" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                age: true,
                gender: true,
                bio: true,
                gymLocation: true,
                fitnessLevel: true,
                fitnessGoal: true,
                profileImage: true,
                course: true,
                year: true,
                questionnaire: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found. Please register first." }, { status: 404 });
        }

        const token = signToken({ userId: user.id, email: user.email });

        const response = NextResponse.json({ user, message: "Login successful" });
        response.cookies.set("auth-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

