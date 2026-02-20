import { cookies } from "next/headers";
import { verifyToken } from "./jwt";
import { prisma } from "./prisma";

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
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
            createdAt: true,
            questionnaire: true,
        },
    });

    return user;
}
