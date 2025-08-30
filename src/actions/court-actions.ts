"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import type { SportType } from "@/generated/prisma";

export interface CreateCourtData {
  name: string;
  facilityId: string;
  sportType: SportType;
  pricePerHour: number;
  operatingStartHour: number;
  operatingEndHour: number;
}

export interface UpdateCourtData extends CreateCourtData {
  id: string;
  isActive?: boolean;
}

export interface CourtWithDetails {
  id: string;
  name: string;
  facilityId: string;
  sportType: SportType;
  pricePerHour: number;
  operatingStartHour: number;
  operatingEndHour: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  facility: {
    id: string;
    name: string;
  };
  _count: {
    bookings: number;
    timeSlots: number;
  };
}

/**
 * Get courts for a specific facility
 */
export async function getFacilityCourts(
  facilityId: string,
): Promise<CourtWithDetails[]> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, role: true },
    });

    if (!playerProfile) {
      throw new Error("Player profile not found");
    }

    // Check if user has access to this facility
    if (playerProfile.role === "FACILITY_OWNER") {
      const facility = await prisma.facility.findUnique({
        where: { id: facilityId },
        select: { ownerId: true },
      });

      if (!facility || facility.ownerId !== playerProfile.id) {
        throw new Error("Access denied to this facility");
      }
    } else if (playerProfile.role !== "ADMIN") {
      throw new Error("Insufficient permissions");
    }

    const courts = await prisma.court.findMany({
      where: { facilityId },
      include: {
        facility: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            timeSlots: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return courts;
  } catch (error) {
    console.error("Error fetching facility courts:", error);
    throw new Error("Failed to fetch courts");
  }
}

/**
 * Get a specific court by ID
 */
export async function getCourtById(courtId: string): Promise<CourtWithDetails> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, role: true },
    });

    if (!playerProfile) {
      throw new Error("Player profile not found");
    }

    const court = await prisma.court.findUnique({
      where: { id: courtId },
      include: {
        facility: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            timeSlots: true,
          },
        },
      },
    });

    if (!court) {
      throw new Error("Court not found");
    }

    // Check if user has access to this court's facility
    if (playerProfile.role === "FACILITY_OWNER") {
      if (court.facility.ownerId !== playerProfile.id) {
        throw new Error("Access denied to this court");
      }
    } else if (playerProfile.role !== "ADMIN") {
      throw new Error("Insufficient permissions");
    }

    return court as CourtWithDetails;
  } catch (error) {
    console.error("Error fetching court:", error);
    throw new Error("Failed to fetch court");
  }
}

/**
 * Create a new court
 */
export async function createCourt(data: CreateCourtData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, role: true },
    });

    if (
      !playerProfile ||
      !["FACILITY_OWNER", "ADMIN"].includes(playerProfile.role)
    ) {
      throw new Error("Insufficient permissions");
    }

    // Check if user owns this facility (if they're not admin)
    if (playerProfile.role === "FACILITY_OWNER") {
      const facility = await prisma.facility.findUnique({
        where: { id: data.facilityId },
        select: { ownerId: true },
      });

      if (!facility || facility.ownerId !== playerProfile.id) {
        throw new Error("Access denied to this facility");
      }
    }

    // Validate data
    if (!data.name || !data.facilityId || !data.sportType) {
      throw new Error("Name, facility, and sport type are required");
    }

    if (data.pricePerHour < 0) {
      throw new Error("Price per hour must be a positive number");
    }

    if (
      data.operatingStartHour < 0 ||
      data.operatingStartHour > 23 ||
      data.operatingEndHour < 0 ||
      data.operatingEndHour > 23
    ) {
      throw new Error("Operating hours must be between 0 and 23");
    }

    if (data.operatingStartHour >= data.operatingEndHour) {
      throw new Error("Start hour must be before end hour");
    }

    const court = await prisma.court.create({
      data: {
        name: data.name,
        facilityId: data.facilityId,
        sportType: data.sportType,
        pricePerHour: data.pricePerHour,
        operatingStartHour: data.operatingStartHour,
        operatingEndHour: data.operatingEndHour,
      },
    });

    revalidatePath(`/dashboard/facilities/${data.facilityId}/courts`);
    revalidatePath(`/dashboard/facilities/${data.facilityId}`);

    return {
      id: court.id,
      name: court.name,
      facilityId: court.facilityId,
    };
  } catch (error) {
    console.error("Error creating court:", error);
    throw new Error("Failed to create court");
  }
}

/**
 * Update an existing court
 */
export async function updateCourt(data: UpdateCourtData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, role: true },
    });

    if (
      !playerProfile ||
      !["FACILITY_OWNER", "ADMIN"].includes(playerProfile.role)
    ) {
      throw new Error("Insufficient permissions");
    }

    // Check if user owns this court's facility (if they're not admin)
    if (playerProfile.role === "FACILITY_OWNER") {
      const court = await prisma.court.findUnique({
        where: { id: data.id },
        include: {
          facility: {
            select: { ownerId: true },
          },
        },
      });

      if (!court || court.facility.ownerId !== playerProfile.id) {
        throw new Error("Court not found or access denied");
      }
    }

    // Validate data
    if (!data.name || !data.sportType) {
      throw new Error("Name and sport type are required");
    }

    if (data.pricePerHour < 0) {
      throw new Error("Price per hour must be a positive number");
    }

    if (
      data.operatingStartHour < 0 ||
      data.operatingStartHour > 23 ||
      data.operatingEndHour < 0 ||
      data.operatingEndHour > 23
    ) {
      throw new Error("Operating hours must be between 0 and 23");
    }

    if (data.operatingStartHour >= data.operatingEndHour) {
      throw new Error("Start hour must be before end hour");
    }

    const court = await prisma.court.update({
      where: { id: data.id },
      data: {
        name: data.name,
        sportType: data.sportType,
        pricePerHour: data.pricePerHour,
        operatingStartHour: data.operatingStartHour,
        operatingEndHour: data.operatingEndHour,
        isActive: data.isActive ?? true,
      },
    });

    revalidatePath(`/dashboard/facilities/${court.facilityId}/courts`);
    revalidatePath(
      `/dashboard/facilities/${court.facilityId}/courts/${court.id}`,
    );
    revalidatePath(`/dashboard/facilities/${court.facilityId}`);

    return {
      id: court.id,
      name: court.name,
      facilityId: court.facilityId,
    };
  } catch (error) {
    console.error("Error updating court:", error);
    throw new Error("Failed to update court");
  }
}

/**
 * Delete a court
 */
export async function deleteCourt(courtId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, role: true },
    });

    if (
      !playerProfile ||
      !["FACILITY_OWNER", "ADMIN"].includes(playerProfile.role)
    ) {
      throw new Error("Insufficient permissions");
    }

    // Check if user owns this court's facility (if they're not admin)
    const court = await prisma.court.findUnique({
      where: { id: courtId },
      include: {
        facility: {
          select: { ownerId: true },
        },
        _count: {
          select: {
            bookings: {
              where: {
                status: "CONFIRMED",
              },
            },
          },
        },
      },
    });

    if (!court) {
      throw new Error("Court not found");
    }

    if (
      playerProfile.role === "FACILITY_OWNER" &&
      court.facility.ownerId !== playerProfile.id
    ) {
      throw new Error("Access denied to this court");
    }

    // Check if there are active bookings
    if (court._count.bookings > 0) {
      throw new Error(
        "Cannot delete court with active bookings. Please cancel all bookings first.",
      );
    }

    await prisma.court.delete({
      where: { id: courtId },
    });

    revalidatePath(`/dashboard/facilities/${court.facilityId}/courts`);
    revalidatePath(`/dashboard/facilities/${court.facilityId}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting court:", error);
    throw new Error("Failed to delete court");
  }
}

/**
 * Toggle court active status
 */
export async function toggleCourtStatus(courtId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, role: true },
    });

    if (
      !playerProfile ||
      !["FACILITY_OWNER", "ADMIN"].includes(playerProfile.role)
    ) {
      throw new Error("Insufficient permissions");
    }

    // Check if user owns this court's facility (if they're not admin)
    const court = await prisma.court.findUnique({
      where: { id: courtId },
      include: {
        facility: {
          select: { ownerId: true },
        },
      },
    });

    if (!court) {
      throw new Error("Court not found");
    }

    if (
      playerProfile.role === "FACILITY_OWNER" &&
      court.facility.ownerId !== playerProfile.id
    ) {
      throw new Error("Access denied to this court");
    }

    const updatedCourt = await prisma.court.update({
      where: { id: courtId },
      data: {
        isActive: !court.isActive,
      },
    });

    revalidatePath(`/dashboard/facilities/${court.facilityId}/courts`);
    revalidatePath(
      `/dashboard/facilities/${court.facilityId}/courts/${court.id}`,
    );

    return {
      id: updatedCourt.id,
      isActive: updatedCourt.isActive,
    };
  } catch (error) {
    console.error("Error toggling court status:", error);
    throw new Error("Failed to toggle court status");
  }
}
