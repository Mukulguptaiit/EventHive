import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { prisma } from "./prisma";
import { tryCatch } from "./trycatch";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Create a minimal UserProfile for new users (schema: user_profile)
export async function createPlayerProfile(
  userId: string,
  userData?: { image?: string | null; name?: string },
  _role?: any,
): Promise<{ success: boolean; error?: string }> {
  const firstName = userData?.name?.split(" ")[0] || "User";
  const lastName = userData?.name?.split(" ").slice(1).join(" ") || "";

  const { error } = await tryCatch(
    prisma.userProfile.upsert({
      where: { userId },
      update: {
        ...(userData?.image !== undefined && { avatar: userData.image || undefined }),
      },
      create: {
        userId,
        firstName,
        lastName,
        avatar: userData?.image || undefined,
  interests: [],
      },
      select: { id: true, userId: true },
    }),
  );

  if (error) {
    // Structured error logging for better monitoring
  console.error("Failed to create user profile:", {
      userId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create user profile",
    };
  }
  return { success: true };
}
