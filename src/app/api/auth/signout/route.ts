import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session")?.value;

    if (sessionToken) {
      // Delete session from database
      await prisma.session.deleteMany({
        where: { token: sessionToken },
      });
    }

    const response = NextResponse.json({ success: true });
    
    // Clear session cookie
    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("Signout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
