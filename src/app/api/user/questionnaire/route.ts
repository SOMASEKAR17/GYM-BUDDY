import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
    workoutSplit: z.string().optional(),
    workoutTime: z.string().optional(),
    workoutDuration: z.string().optional(),
    trainingStyle: z.string().optional(),
    experienceLevel: z.string().optional(),
    preferredPartnerTraits: z.array(z.string()).optional(),
    daysPerWeek: z.number().int().min(1).max(7).optional(),
    comfortableSpotting: z.boolean().optional(),
    strictRoutine: z.boolean().optional(),
    flexibleSchedule: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
        }

        const questionnaire = await prisma.questionnaire.upsert({
            where: { userId: user.id },
            create: { userId: user.id, ...parsed.data },
            update: parsed.data,
        });

        return NextResponse.json({ questionnaire });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET() {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const questionnaire = await prisma.questionnaire.findUnique({
        where: { userId: user.id },
    });

    return NextResponse.json({ questionnaire });
}

