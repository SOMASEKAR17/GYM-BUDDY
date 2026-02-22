import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: prId } = await params;

        const pr = await prisma.pr.findUnique({
            where: { id: prId },
            include: { group: { include: { members: true } } }
        });

        if (!pr) return NextResponse.json({ error: "PR not found" }, { status: 404 });

        // Check if user is in the same group
        if (!pr.group) {
            return NextResponse.json({ error: "No group associated with this PR" }, { status: 400 });
        }

        const isMember = pr.group.members.some(m => m.userId === user.id);
        if (!isMember) {
            return NextResponse.json({ error: "Only group members can endorse PRs" }, { status: 403 });
        }

        if (pr.userId === user.id) {
            return NextResponse.json({ error: "You cannot endorse your own PR" }, { status: 400 });
        }

        // Check if already endorsed
        const existing = await prisma.prEndorsement.findUnique({
            where: { prId_endorsedByUserId: { prId, endorsedByUserId: user.id } }
        });
        if (existing) {
            return NextResponse.json({ error: "Already endorsed" }, { status: 400 });
        }

        await prisma.prEndorsement.create({
            data: { prId, endorsedByUserId: user.id }
        });

        // Check if verification threshold is met
        // Requirement: Minimum 50% of group members must endorse
        const endorsementsCount = await prisma.prEndorsement.count({ where: { prId } });
        const memberCount = pr.group.members.length;

        // threshold: if endorsements >= (memberCount - 1) / 2 (excluding the owner)
        // Actually the rule says 50% of members. 
        // If members = 4, threshold = 2.
        if (endorsementsCount >= Math.ceil(memberCount / 2)) {
            await prisma.pr.update({
                where: { id: prId },
                data: { status: "VERIFIED" }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Endorse PR Error:", error);
        return NextResponse.json({ error: "Failed to endorse PR" }, { status: 500 });
    }
}
