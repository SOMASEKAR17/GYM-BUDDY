import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Convert file to array buffer and then to base64 for Cloudinary
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Content = `data:${file.type};base64,${buffer.toString("base64")}`;

        // Upload to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(base64Content, {
            folder: "gym-buddy",
            public_id: `user_${user.id}`,
            overwrite: true,
        });

        const imageUrl = uploadResponse.secure_url;

        // Update user in DB
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { profileImage: imageUrl },
            select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
            }
        });

        return NextResponse.json({ user: updatedUser, imageUrl });
    } catch (error) {
        console.error("Profile image upload error:", error);
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }
}
