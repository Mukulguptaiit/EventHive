/**
 * Utility script to set a user as admin
 * Run this in Prisma Studio console or create a simple API route
 */

import { prisma } from "@/lib/prisma";

// Example function to promote a user to admin
export async function promoteUserToAdmin(userEmail: string) {
  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { playerProfile: true },
    });

    if (!user) {
      console.error(`User with email ${userEmail} not found`);
      return { success: false, error: "User not found" };
    }

    if (!user.playerProfile) {
      // Create player profile if it doesn't exist
      await prisma.playerProfile.create({
        data: {
          userId: user.id,
          role: "ADMIN",
          isActive: true,
        },
      });

      return { success: true, message: `User ${userEmail} promoted to admin` };
    } else {
      // Update existing player profile to admin
      await prisma.playerProfile.update({
        where: { userId: user.id },
        data: { role: "ADMIN" },
      });

      return { success: true, message: `User ${userEmail} promoted to admin` };
    }
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    return { success: false, error: "Failed to promote user" };
  }
}

// Example function to check admin users
export async function getAdminUsers() {
  try {
    const adminUsers = await prisma.playerProfile.findMany({
      where: { role: "ADMIN" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    return adminUsers;
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return [];
  }
}
