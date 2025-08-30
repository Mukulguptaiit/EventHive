import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { uploadAvatar, validateAvatarFile } from "@/lib/avatar-upload";

// Validation schema for profile updates
const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  phoneNumber: z.string().optional(),
  bio: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  linkedIn: z.string().optional(),
  twitter: z.string().optional(),
  oldPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the user's complete profile data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        bio: true,
        address: true,
        dateOfBirth: true,
        gender: true,
        website: true,
        linkedIn: true,
        twitter: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch the user's player profile with role information
    let playerProfile;
    try {
      playerProfile = await prisma.playerProfile.findUnique({
        where: { userId: session.user.id },
        select: {
          id: true,
          role: true,
          phoneNumber: true,
          avatar: true,
          isActive: true,
          isBanned: true,
          bannedUntil: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      console.error("Error fetching player profile:", error);
      playerProfile = null;
    }

    // Check if user is banned
    if (playerProfile?.isBanned) {
      const now = new Date();
      if (playerProfile.bannedUntil && playerProfile.bannedUntil > now) {
        return NextResponse.json(
          {
            error: "Account suspended",
            bannedUntil: playerProfile.bannedUntil.toISOString(),
          },
          { status: 403 },
        );
      }
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      bio: user.bio,
      address: user.address,
      dateOfBirth: user.dateOfBirth?.toISOString(),
      gender: user.gender,
      website: user.website,
      linkedIn: user.linkedIn,
      twitter: user.twitter,
      phoneNumber: playerProfile?.phoneNumber ?? null,
      role: playerProfile?.role ?? "USER",
      avatar: playerProfile?.avatar ?? null,
      isActive: playerProfile?.isActive ?? true,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type");
    let validatedData;
    let avatarFile: File | null = null;

    if (contentType?.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await request.formData();

      // Extract avatar file if present
      const avatar = formData.get("avatar") as File | null;
      if (avatar && avatar.size > 0) {
        avatarFile = avatar;
      }

      // Extract other form fields
      const profileData = {
        name: (formData.get("name") as string) || undefined,
        email: (formData.get("email") as string) || undefined,
        phoneNumber: (formData.get("phoneNumber") as string) || undefined,
        bio: (formData.get("bio") as string) || undefined,
        address: (formData.get("address") as string) || undefined,
        dateOfBirth: (formData.get("dateOfBirth") as string) || undefined,
        gender: (formData.get("gender") as string) || undefined,
        website: (formData.get("website") as string) || undefined,
        linkedIn: (formData.get("linkedIn") as string) || undefined,
        twitter: (formData.get("twitter") as string) || undefined,
        oldPassword: (formData.get("oldPassword") as string) || undefined,
        newPassword: (formData.get("newPassword") as string) || undefined,
      };

      // Remove empty fields
      Object.keys(profileData).forEach((key) => {
        if (!profileData[key as keyof typeof profileData]) {
          delete profileData[key as keyof typeof profileData];
        }
      });

      validatedData = updateProfileSchema.parse(profileData);
    } else {
      // Handle JSON data (existing flow)
      const body = (await request.json()) as unknown;
      validatedData = updateProfileSchema.parse(body);
    }

    // Start building the update object
    const updateData: {
      name?: string;
      email?: string;
      image?: string;
      bio?: string;
      address?: string;
      dateOfBirth?: Date;
      gender?: string;
      website?: string;
      linkedIn?: string;
      twitter?: string;
    } = {};

    // Handle avatar upload
    if (avatarFile) {
      try {
        // Validate the avatar file
        const validationError = validateAvatarFile(avatarFile);
        if (validationError) {
          return NextResponse.json({ error: validationError }, { status: 400 });
        }

        // Upload the avatar
        const uploadedFile = await uploadAvatar(avatarFile);
        updateData.image = uploadedFile.url;
      } catch (error) {
        console.error("Error processing avatar:", error);
        return NextResponse.json(
          { error: "Failed to process avatar image" },
          { status: 400 },
        );
      }
    }

    // Handle basic profile fields
    if (validatedData.name) {
      updateData.name = validatedData.name;
    }

    if (validatedData.email) {
      updateData.email = validatedData.email;
    }

    if (validatedData.bio !== undefined) {
      updateData.bio = validatedData.bio;
    }

    if (validatedData.address !== undefined) {
      updateData.address = validatedData.address;
    }

    if (validatedData.dateOfBirth !== undefined) {
      updateData.dateOfBirth = validatedData.dateOfBirth
        ? new Date(validatedData.dateOfBirth)
        : null;
    }

    if (validatedData.gender !== undefined) {
      updateData.gender = validatedData.gender;
    }

    if (validatedData.website !== undefined) {
      updateData.website = validatedData.website || null;
    }

    if (validatedData.linkedIn !== undefined) {
      updateData.linkedIn = validatedData.linkedIn;
    }

    if (validatedData.twitter !== undefined) {
      updateData.twitter = validatedData.twitter;
    }

    // Handle password change
    if (validatedData.oldPassword && validatedData.newPassword) {
      try {
        // Use better-auth's change password functionality
        const passwordChangeResult = await auth.api.changePassword({
          body: {
            currentPassword: validatedData.oldPassword,
            newPassword: validatedData.newPassword,
            revokeOtherSessions: true, // Security: revoke other sessions when password changes
          },
          headers: request.headers,
        });

        if (!passwordChangeResult) {
          return NextResponse.json(
            {
              error:
                "Failed to change password. Please check your current password.",
            },
            { status: 400 },
          );
        }
      } catch (error) {
        console.error("Password change error:", error);
        return NextResponse.json(
          {
            error:
              "Failed to change password. Please check your current password.",
          },
          { status: 400 },
        );
      }
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    // Handle PlayerProfile updates
    if (validatedData.phoneNumber !== undefined) {
      await prisma.playerProfile.upsert({
        where: { userId: session.user.id },
        update: { phoneNumber: validatedData.phoneNumber },
        create: {
          userId: session.user.id,
          phoneNumber: validatedData.phoneNumber,
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        bio: updatedUser.bio,
        address: updatedUser.address,
        dateOfBirth: updatedUser.dateOfBirth?.toISOString(),
        gender: updatedUser.gender,
        website: updatedUser.website,
        linkedIn: updatedUser.linkedIn,
        twitter: updatedUser.twitter,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
