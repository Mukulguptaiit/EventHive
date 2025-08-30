import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { prisma } from "./prisma";
import { tryCatch } from "./trycatch";
import type { $Enums } from "@/generated/prisma";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function to create attendee profile for new users
export async function createAttendeeProfile(
  userId: string,
  userData?: { image?: string | null; name?: string },
  role: $Enums.UserRole = "ATTENDEE",
): Promise<{ success: boolean; error?: string }> {
  const { error } = await tryCatch(
    prisma.attendeeProfile.upsert({
      where: { userId },
      update: {
        // Only update if needed - avoid unnecessary writes
        ...(userData?.image !== undefined && { avatar: userData.image }),
        role, // Update role if user already exists
        isActive: true, // Reactivate if user returns
      },
      create: {
        userId,
        role, // Use the provided role instead of hardcoded default
        avatar: userData?.image ?? null,
        isActive: true,
        isBanned: false,
      },
      // Select only what you need - avoid SELECT *
      select: {
        id: true,
        userId: true,
        role: true,
        isActive: true,
      },
    }),
  );

  if (error) {
    // Structured error logging for better monitoring
    console.error("Failed to create attendee profile:", {
      userId,
      role,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create attendee profile",
    };
  }
  return { success: true };
}
