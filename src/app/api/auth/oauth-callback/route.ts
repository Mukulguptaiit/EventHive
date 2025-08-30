import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface UserData {
  image?: string | null;
}

interface RequestBody {
  userId: string;
  userData?: UserData;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestBody;
    const { userId, userData } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Check if player profile already exists
    const existingProfile = await prisma.playerProfile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      await prisma.playerProfile.create({
        data: {
          userId,
          role: "USER",
          avatar: userData?.image ?? null,
          isActive: true,
          isBanned: false,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Player profile created successfully",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Player profile already exists",
    });
  } catch (error) {
    console.error("Failed to create player profile:", error);
    return NextResponse.json(
      { error: "Failed to create player profile" },
      { status: 500 },
    );
  }
}
