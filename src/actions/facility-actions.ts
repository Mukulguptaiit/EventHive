"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import type { FacilityStatus, VenueType } from "@/types/venue";

export interface CreateFacilityData {
  name: string;
  description?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  amenities: string[];
  photos: string[];
  phone?: string;
  email?: string;
  policies: string[];
  venueType: VenueType;
}

export interface UpdateFacilityData extends CreateFacilityData {
  id: string;
}

/**
 * Get facilities owned by the current user
 */
export async function getUserFacilities() {
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

    const whereClause: any = {};
    if (playerProfile.role === "FACILITY_OWNER") {
      whereClause.ownerId = playerProfile.id;
    }

    const facilities = await prisma.facility.findMany({
      where: whereClause,
      include: {
        courts: {
          select: {
            id: true,
            name: true,
            sportType: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            courts: { where: { isActive: true } },
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return facilities.map((facility) => ({
      id: facility.id,
      name: facility.name,
      description: facility.description,
      address: facility.address,
      amenities: facility.amenities,
      photos: facility.photos,
      phone: facility.phone,
      email: facility.email,
      policies: facility.policies,
      venueType: facility.venueType,
      status: facility.status,
      rating: facility.rating,
      reviewCount: facility.reviewCount,
      courtsCount: facility._count.courts,
      courts: facility.courts,
      createdAt: facility.createdAt.toISOString(),
      updatedAt: facility.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching user facilities:", error);
    throw new Error("Failed to fetch facilities");
  }
}

/**
 * Get a specific facility by ID
 */
export async function getFacilityById(facilityId: string) {
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

    const whereClause: any = { id: facilityId };
    if (playerProfile.role === "FACILITY_OWNER") {
      whereClause.ownerId = playerProfile.id;
    }

    const facility = await prisma.facility.findUnique({
      where: whereClause,
      include: {
        courts: {
          include: {
            _count: {
              select: {
                bookings: { where: { status: "CONFIRMED" } },
              },
            },
          },
        },
        reviews: {
          include: {
            player: {
              select: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        _count: {
          select: {
            courts: { where: { isActive: true } },
            reviews: true,
          },
        },
      },
    });

    if (!facility) {
      throw new Error("Facility not found");
    }

    return {
      id: facility.id,
      name: facility.name,
      description: facility.description,
      address: facility.address,
      latitude: facility.latitude,
      longitude: facility.longitude,
      amenities: facility.amenities,
      photos: facility.photos,
      phone: facility.phone,
      email: facility.email,
      policies: facility.policies,
      venueType: facility.venueType,
      status: facility.status,
      rating: facility.rating,
      reviewCount: facility.reviewCount,
      courts: facility.courts.map((court) => ({
        id: court.id,
        name: court.name,
        sportType: court.sportType,
        pricePerHour: court.pricePerHour,
        operatingStartHour: court.operatingStartHour,
        operatingEndHour: court.operatingEndHour,
        isActive: court.isActive,
        activeBookings: court._count.bookings,
      })),
      reviews: facility.reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        playerName: review.player.user.name,
        createdAt: review.createdAt.toISOString(),
      })),
      createdAt: facility.createdAt.toISOString(),
      updatedAt: facility.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Error fetching facility:", error);
    throw new Error("Failed to fetch facility");
  }
}

/**
 * Create a new facility
 */
export async function createFacility(data: CreateFacilityData) {
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

    // Validate required fields
    if (!data.name || !data.address) {
      throw new Error("Name and address are required");
    }

    const facility = await prisma.facility.create({
      data: {
        name: data.name,
        description: data.description,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        amenities: data.amenities,
        photos: data.photos,
        phone: data.phone,
        email: data.email,
        policies: data.policies,
        venueType: data.venueType,
        ownerId: playerProfile.id,
        status: "PENDING" as FacilityStatus,
      },
    });

    revalidatePath("/dashboard/facilities");

    return {
      id: facility.id,
      name: facility.name,
      status: facility.status,
    };
  } catch (error) {
    console.error("Error creating facility:", error);
    throw new Error("Failed to create facility");
  }
}

/**
 * Update an existing facility
 */
export async function updateFacility(data: UpdateFacilityData) {
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
      const existingFacility = await prisma.facility.findUnique({
        where: { id: data.id },
        select: { ownerId: true },
      });

      if (!existingFacility || existingFacility.ownerId !== playerProfile.id) {
        throw new Error("Facility not found or access denied");
      }
    }

    // Validate required fields
    if (!data.name || !data.address) {
      throw new Error("Name and address are required");
    }

    const facility = await prisma.facility.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        amenities: data.amenities,
        photos: data.photos,
        phone: data.phone,
        email: data.email,
        policies: data.policies,
        venueType: data.venueType,
      },
    });

    revalidatePath("/dashboard/facilities");
    revalidatePath(`/dashboard/facilities/${data.id}`);

    return {
      id: facility.id,
      name: facility.name,
      status: facility.status,
    };
  } catch (error) {
    console.error("Error updating facility:", error);
    throw new Error("Failed to update facility");
  }
}

/**
 * Delete a facility
 */
export async function deleteFacility(facilityId: string) {
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
      const existingFacility = await prisma.facility.findUnique({
        where: { id: facilityId },
        select: { ownerId: true },
      });

      if (!existingFacility || existingFacility.ownerId !== playerProfile.id) {
        throw new Error("Facility not found or access denied");
      }
    }

    // Check if facility has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        court: {
          facilityId,
        },
        status: "CONFIRMED",
        timeSlot: {
          startTime: {
            gte: new Date(),
          },
        },
      },
    });

    if (activeBookings > 0) {
      throw new Error("Cannot delete facility with active bookings");
    }

    await prisma.facility.delete({
      where: { id: facilityId },
    });

    revalidatePath("/dashboard/facilities");

    return { success: true };
  } catch (error) {
    console.error("Error deleting facility:", error);
    throw new Error("Failed to delete facility");
  }
}
