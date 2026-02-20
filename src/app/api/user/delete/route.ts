import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { adminAuth } from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";

export async function DELETE(req: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Delete from Firebase Authentication
        try {
            const firebaseUser = await adminAuth.getUserByEmail(user.email);
            if (firebaseUser) {
                await adminAuth.deleteUser(firebaseUser.uid);
            }
        } catch (fbError: any) {
            // If user not found in firebase, we still proceed to delete from local DB
            if (fbError.code !== 'auth/user-not-found') {
                console.error("Firebase delete error:", fbError);
            }
        }

        // 2. Delete from local Prisma database (cascading delete handles the rest)
        await prisma.user.delete({
            where: { id: user.id }
        });

        // 3. Clear the auth cookie
        const cookieStore = await cookies();
        cookieStore.delete("auth-token");

        return NextResponse.json({ message: "Account successfully deleted" });
    } catch (error) {
        console.error("Account deletion error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
