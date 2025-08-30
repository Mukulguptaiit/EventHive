import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ user: null });
    }

    // Find session
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: {
        user: {
          include: {
            userProfile: true,
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        // Note: role is not stored in the current schema
        // You can add role logic here if needed
        profile: session.user.userProfile,
      },
    });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({ user: null });
  }
}
