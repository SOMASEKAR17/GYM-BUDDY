import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { adminAuth } from "@/lib/fbAdmin";
import { z } from "zod";

const schema = z.object({
    idToken: z.string(),
    name: z.string().min(2),
    course: z.string().optional(),
    year: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = schema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        const { idToken, name, course, year } = parsed.data;

        // Verify Firebase Token
        let decodedToken;
        try {
            decodedToken = await adminAuth.verifyIdToken(idToken);
        } catch (err) {
            console.error("Firebase token verification failed:", err);
            return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 });
        }

        const email = decodedToken.email;
        if (!email || !email.endsWith("@vitstudent.ac.in")) {
            return NextResponse.json({ error: "Only @vitstudent.ac.in emails are allowed" }, { status: 403 });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: "Email already registered" }, { status: 409 });
        }

        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: "FIREBASE_AUTH", // Placeholder since we use Firebase
                course,
                year
            },
            select: { id: true, name: true, email: true, course: true, year: true },
        });

        const token = signToken({ userId: user.id, email: user.email });

        const response = NextResponse.json({ user, message: "Account created!" }, { status: 201 });
        response.cookies.set("auth-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Register error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

