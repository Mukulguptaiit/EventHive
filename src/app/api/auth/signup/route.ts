import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, image, role } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    const now = new Date();
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        id: randomUUID(),
        email,
        name,
        image: image || null,
        emailVerified: false, // Will be verified later
        createdAt: now,
        updatedAt: now,
      },
    });

    // Create user profile
    const userProfile = await prisma.userProfile.create({
      data: {
        id: randomUUID(),
        userId: user.id,
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || '',
        displayName: name,
        avatar: image || null,
        isEmailVerified: false,
        createdAt: now,
        updatedAt: now,
      },
    });

    // Create account (for authentication)
    await prisma.account.create({
      data: {
        id: randomUUID(),
        accountId: email,
        providerId: "email",
        userId: user.id,
        password: passwordHash,
        createdAt: now,
        updatedAt: now,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profile: userProfile,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
