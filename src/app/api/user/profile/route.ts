import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
    name: z.string().min(2).optional(),
    age: z.number().int().min(16).max(60).optional(),
    gender: z.string().optional(),
    bio: z.string().max(300).optional(),
    gymLocation: z.string().optional(),
    fitnessLevel: z.string().optional(),
    fitnessGoal: z.string().optional(),
    profileImage: z.string().optional(),
    course: z.string().optional(),
    year: z.string().optional(),
});

export async function GET() {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
        }

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: parsed.data,
            select: {
                id: true, name: true, email: true, age: true, gender: true,
                bio: true, gymLocation: true, fitnessLevel: true, fitnessGoal: true,
                profileImage: true, course: true, year: true, questionnaire: true,
            },
        });

        return NextResponse.json({ user: updated });
    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

