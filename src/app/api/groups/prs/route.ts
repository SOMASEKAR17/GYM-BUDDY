import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const membership = await prisma.groupMember.findUnique({
            where: { userId: user.id }
        });
        if (!membership) {
            return NextResponse.json({ error: "You must be in a group to submit a PR" }, { status: 400 });
        }

        const { exerciseName, weight, reps, proofUrl } = await req.json();

        const memberCount = await prisma.groupMember.count({
            where: { groupId: membership.groupId }
        });

        const pr = await prisma.pr.create({
            data: {
                userId: user.id,
                groupId: membership.groupId,
                exerciseName,
                weight: parseFloat(weight),
                reps: parseInt(reps),
                status: memberCount === 1 ? "VERIFIED" : "PENDING",
                proofUrl
            }
        });

        return NextResponse.json({ pr });
    } catch (error) {
        console.error("POST PR Error:", error);
        return NextResponse.json({ error: "Failed to submit PR" }, { status: 500 });
    }
}
