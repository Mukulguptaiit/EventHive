"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkUserFacilityOwnership } from "@/lib/auth-utils";

// Helper function to check if user owns a facility
async function checkFacilityOwnership(
  userId: string,
  facilityId: string,
): Promise<boolean> {
  return await checkUserFacilityOwnership(userId, facilityId);
}

export interface CreateTimeSlotData {
  courtId: string;
  startTime: Date;
  endTime: Date;
  price?: number; // Optional custom price
  isMaintenanceBlocked?: boolean;
  maintenanceReason?: string;
}

export interface UpdateTimeSlotData extends CreateTimeSlotData {
  id: string;
}

export interface TimeSlotFilters {
  date?: Date;
  isMaintenanceBlocked?: boolean;
  isBooked?: boolean;
}

export interface GenerateTimeSlotsData {
  courtId: string;
  startDate: Date;
  endDate: Date;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  slotDuration: number; // in minutes
  daysOfWeek: number[]; // 0-6 where 0 is Sunday
  useCustomPricing?: boolean;
  weekdayPrice?: number;
  weekendPrice?: number;
}

// Get time slots for a specific court
export async function getCourtTimeSlots(
  courtId: string,
  filters?: TimeSlotFilters,
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      redirect("/auth/login");
    }

    const whereClause: any = {
      courtId,
    };

    // Apply date filter if provided
    if (filters?.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.startTime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    // Apply maintenance filter if provided
    if (filters?.isMaintenanceBlocked !== undefined) {
      whereClause.isMaintenanceBlocked = filters.isMaintenanceBlocked;
    }

    // Apply booking filter if provided
    if (filters?.isBooked !== undefined) {
      if (filters.isBooked) {
        whereClause.booking = { isNot: null };
      } else {
        whereClause.booking = null;
      }
    }

    const timeSlots = await prisma.timeSlot.findMany({
      where: whereClause,
      include: {
        court: {
          select: {
            id: true,
            name: true,
            sportType: true,
            pricePerHour: true,
          },
        },
        bookings: {
          select: {
            id: true,
            status: true,
            totalPrice: true,
            player: {
              select: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            waitlistEntries: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return timeSlots;
  } catch (error) {
    console.error("Failed to fetch court time slots:", error);
    throw new Error("Failed to fetch court time slots");
  }
}

// Create a new time slot
export async function createTimeSlot(data: CreateTimeSlotData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      redirect("/auth/login");
    }

    // Verify user has access to the court's facility
    const court = await prisma.court.findUnique({
      where: { id: data.courtId },
      include: {
        facility: {
          select: {
            id: true,
            ownerId: true,
          },
        },
      },
    });

    if (!court) {
      throw new Error("Court not found");
    }

    // Check authorization (facility owner or admin)
    const userRole = session.user.role;
    const isOwner = await checkFacilityOwnership(
      session.user.id,
      court.facility.id,
    );
    const isAdmin = userRole === "ADMIN";

    if (!isOwner && !isAdmin) {
      throw new Error("Unauthorized to create time slots for this court");
    }

    // Check for overlapping time slots
    const overlapping = await prisma.timeSlot.findFirst({
      where: {
        courtId: data.courtId,
        OR: [
          {
            AND: [
              { startTime: { lte: data.startTime } },
              { endTime: { gt: data.startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: data.endTime } },
              { endTime: { gte: data.endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: data.startTime } },
              { endTime: { lte: data.endTime } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      throw new Error("Time slot overlaps with existing time slot");
    }

    // Create the time slot
    const timeSlot = await prisma.timeSlot.create({
      data: {
        courtId: data.courtId,
        startTime: data.startTime,
        endTime: data.endTime,
        price: data.price, // Will be null if not provided, falling back to court's default price
        isMaintenanceBlocked: data.isMaintenanceBlocked || false,
        maintenanceReason: data.maintenanceReason,
      },
      include: {
        court: {
          select: {
            facilityId: true,
          },
        },
      },
    });

    revalidatePath(`/dashboard/facilities/${timeSlot.court.facilityId}/courts`);
    revalidatePath(
      `/dashboard/facilities/${timeSlot.court.facilityId}/courts/${data.courtId}/time-slots`,
    );

    return timeSlot;
  } catch (error) {
    console.error("Failed to create time slot:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create time slot",
    );
  }
}

// Generate time slots for a court for a specific date range
export async function generateTimeSlots(
  courtId: string,
  startDate: Date,
  endDate: Date,
  slotDurationMinutes = 60,
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      redirect("/auth/login");
    }

    // Get court with operating hours
    const court = await prisma.court.findUnique({
      where: { id: courtId },
      include: {
        facility: {
          select: {
            id: true,
            ownerId: true,
          },
        },
      },
    });

    if (!court) {
      throw new Error("Court not found");
    }

    // Check authorization
    const userRole = session.user.role;
    const isOwner = await checkFacilityOwnership(
      session.user.id,
      court.facility.id,
    );
    const isAdmin = userRole === "ADMIN";

    if (!isOwner && !isAdmin) {
      throw new Error("Unauthorized to generate time slots for this court");
    }

    const timeSlotsToCreate = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate);
      dayStart.setHours(court.operatingStartHour, 0, 0, 0);

      const dayEnd = new Date(currentDate);
      dayEnd.setHours(court.operatingEndHour, 0, 0, 0);

      let slotStart = new Date(dayStart);

      while (slotStart < dayEnd) {
        const slotEnd = new Date(
          slotStart.getTime() + slotDurationMinutes * 60 * 1000,
        );

        if (slotEnd <= dayEnd) {
          timeSlotsToCreate.push({
            courtId,
            startTime: new Date(slotStart),
            endTime: new Date(slotEnd),
            price: null, // Use court's default price
            isMaintenanceBlocked: false,
          });
        }

        slotStart = new Date(slotEnd);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Check for existing time slots to avoid duplicates
    const existingSlots = await prisma.timeSlot.findMany({
      where: {
        courtId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // Filter out existing slots
    const existingSlotKeys = new Set(
      existingSlots.map(
        (slot) => `${slot.startTime.getTime()}-${slot.endTime.getTime()}`,
      ),
    );

    const newTimeSlots = timeSlotsToCreate.filter(
      (slot) =>
        !existingSlotKeys.has(
          `${slot.startTime.getTime()}-${slot.endTime.getTime()}`,
        ),
    );

    if (newTimeSlots.length === 0) {
      throw new Error("No new time slots to create (all slots already exist)");
    }

    // Batch create time slots
    await prisma.timeSlot.createMany({
      data: newTimeSlots,
    });

    revalidatePath(`/dashboard/facilities/${court.facility.id}/courts`);
    revalidatePath(
      `/dashboard/facilities/${court.facility.id}/courts/${courtId}/time-slots`,
    );

    return {
      success: true,
      created: newTimeSlots.length,
      skipped: timeSlotsToCreate.length - newTimeSlots.length,
    };
  } catch (error) {
    console.error("Failed to generate time slots:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate time slots",
    );
  }
}

// Update an existing time slot
export async function updateTimeSlot(data: UpdateTimeSlotData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      redirect("/auth/login");
    }

    // Get the existing time slot
    const existingTimeSlot = await prisma.timeSlot.findUnique({
      where: { id: data.id },
      include: {
        court: {
          include: {
            facility: {
              select: {
                id: true,
                ownerId: true,
              },
            },
          },
        },
        bookings: true,
      },
    });

    if (!existingTimeSlot) {
      throw new Error("Time slot not found");
    }

    // Check authorization
    const userRole = session.user.role;
    const isOwner = await checkFacilityOwnership(
      session.user.id,
      existingTimeSlot.court.facility.id,
    );
    const isAdmin = userRole === "ADMIN";

    if (!isOwner && !isAdmin) {
      throw new Error("Unauthorized to update this time slot");
    }

    // Check if time slot has a booking and prevent certain updates
    if (
      existingTimeSlot.bookings?.some(
        (booking) => booking.status === "CONFIRMED",
      )
    ) {
      // For booked slots, only allow maintenance blocking/unblocking
      if (
        data.startTime.getTime() !== existingTimeSlot.startTime.getTime() ||
        data.endTime.getTime() !== existingTimeSlot.endTime.getTime()
      ) {
        throw new Error("Cannot modify time for a booked slot");
      }
    }

    // Check for overlapping time slots (excluding current slot)
    if (
      data.startTime.getTime() !== existingTimeSlot.startTime.getTime() ||
      data.endTime.getTime() !== existingTimeSlot.endTime.getTime()
    ) {
      const overlapping = await prisma.timeSlot.findFirst({
        where: {
          courtId: data.courtId,
          id: { not: data.id },
          OR: [
            {
              AND: [
                { startTime: { lte: data.startTime } },
                { endTime: { gt: data.startTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: data.endTime } },
                { endTime: { gte: data.endTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: data.startTime } },
                { endTime: { lte: data.endTime } },
              ],
            },
          ],
        },
      });

      if (overlapping) {
        throw new Error("Time slot overlaps with existing time slot");
      }
    }

    // Update the time slot
    const updatedTimeSlot = await prisma.timeSlot.update({
      where: { id: data.id },
      data: {
        startTime: data.startTime,
        endTime: data.endTime,
        price: data.price,
        isMaintenanceBlocked: data.isMaintenanceBlocked,
        maintenanceReason: data.maintenanceReason,
      },
    });

    revalidatePath(
      `/dashboard/facilities/${existingTimeSlot.court.facility.id}/courts`,
    );
    revalidatePath(
      `/dashboard/facilities/${existingTimeSlot.court.facility.id}/courts/${data.courtId}/time-slots`,
    );

    return updatedTimeSlot;
  } catch (error) {
    console.error("Failed to update time slot:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update time slot",
    );
  }
}

// Delete a time slot
export async function deleteTimeSlot(timeSlotId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      redirect("/auth/login");
    }

    // Get the time slot with related data
    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id: timeSlotId },
      include: {
        court: {
          include: {
            facility: {
              select: {
                id: true,
                ownerId: true,
              },
            },
          },
        },
        bookings: true,
      },
    });

    if (!timeSlot) {
      throw new Error("Time slot not found");
    }

    // Check authorization
    const userRole = session.user.role;
    const isOwner = await checkFacilityOwnership(
      session.user.id,
      timeSlot.court.facility.id,
    );
    const isAdmin = userRole === "ADMIN";

    if (!isOwner && !isAdmin) {
      throw new Error("Unauthorized to delete this time slot");
    }

    // Check if time slot has a confirmed bookings
    if (timeSlot.bookings?.some((booking) => booking.status === "CONFIRMED")) {
      throw new Error("Cannot delete a time slot with a confirmed bookings");
    }

    // Delete the time slot
    await prisma.timeSlot.delete({
      where: { id: timeSlotId },
    });

    revalidatePath(
      `/dashboard/facilities/${timeSlot.court.facility.id}/courts`,
    );
    revalidatePath(
      `/dashboard/facilities/${timeSlot.court.facility.id}/courts/${timeSlot.courtId}/time-slots`,
    );

    return { success: true };
  } catch (error) {
    console.error("Failed to delete time slot:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete time slot",
    );
  }
}

// Get a single time slot by ID
export async function getTimeSlotById(timeSlotId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      redirect("/auth/login");
    }

    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id: timeSlotId },
      include: {
        court: {
          include: {
            facility: {
              select: {
                id: true,
                name: true,
                ownerId: true,
              },
            },
          },
        },
        bookings: {
          include: {
            player: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            waitlistEntries: true,
          },
        },
      },
    });

    if (!timeSlot) {
      throw new Error("Time slot not found");
    }

    // Check authorization
    const userRole = session.user.role;
    const isOwner = await checkUserFacilityOwnership(
      session.user.id,
      timeSlot.court.facility.id,
    );
    const isAdmin = userRole === "ADMIN";

    if (!isOwner && !isAdmin) {
      throw new Error("Unauthorized to view this time slot");
    }

    return timeSlot;
  } catch (error) {
    console.error("Failed to fetch time slot:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch time slot",
    );
  }
}

// Generate time slots with advanced configuration
export async function generateTimeSlotsAdvanced(data: GenerateTimeSlotsData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      redirect("/auth/login");
    }

    // Get the court and verify access
    const court = await prisma.court.findUnique({
      where: { id: data.courtId },
      include: {
        facility: {
          select: {
            id: true,
            ownerId: true,
          },
        },
      },
    });

    if (!court) {
      throw new Error("Court not found");
    }

    // Check authorization
    const userRole = session.user.role;
    const isOwner = await checkFacilityOwnership(
      session.user.id,
      court.facility.id,
    );
    const isAdmin = userRole === "ADMIN";

    if (!isOwner && !isAdmin) {
      throw new Error("Unauthorized to generate time slots for this court");
    }

    // Parse time strings to get hours and minutes
    const [startHour, startMin] = data.startTime.split(":").map(Number);
    const [endHour, endMin] = data.endTime.split(":").map(Number);

    // Generate time slots
    const timeSlotsToCreate = [];
    const currentDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    while (currentDate <= endDate) {
      // Check if current day is in the selected days of week
      if (data.daysOfWeek.includes(currentDate.getDay())) {
        // Generate slots for this day
        let currentTime = new Date(currentDate);
        currentTime.setHours(startHour, startMin, 0, 0);

        const dayEnd = new Date(currentDate);
        dayEnd.setHours(endHour, endMin, 0, 0);

        while (currentTime < dayEnd) {
          const slotEnd = new Date(
            currentTime.getTime() + data.slotDuration * 60 * 1000,
          );

          // Don't create slot if it goes beyond end time
          if (slotEnd <= dayEnd) {
            // Determine price based on day of week if custom pricing is enabled
            let slotPrice: number | undefined;
            if (data.useCustomPricing) {
              const isWeekend =
                currentDate.getDay() === 0 || currentDate.getDay() === 6; // Sunday or Saturday
              slotPrice = isWeekend ? data.weekendPrice : data.weekdayPrice;
            }

            timeSlotsToCreate.push({
              courtId: data.courtId,
              startTime: new Date(currentTime),
              endTime: new Date(slotEnd),
              price: slotPrice,
              isMaintenanceBlocked: false,
            });
          }

          currentTime = new Date(slotEnd);
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Check for existing overlapping time slots and filter them out
    const existingTimeSlots = await prisma.timeSlot.findMany({
      where: {
        courtId: data.courtId,
        OR: timeSlotsToCreate.map((slot) => ({
          AND: [
            { startTime: { lt: slot.endTime } },
            { endTime: { gt: slot.startTime } },
          ],
        })),
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // Filter out overlapping slots
    const nonOverlappingSlots = timeSlotsToCreate.filter((newSlot) => {
      return !existingTimeSlots.some((existing) => {
        return (
          newSlot.startTime < existing.endTime &&
          newSlot.endTime > existing.startTime
        );
      });
    });

    // Create the non-overlapping time slots
    const newTimeSlots = await prisma.timeSlot.createMany({
      data: nonOverlappingSlots,
      skipDuplicates: true,
    });

    revalidatePath(`/dashboard/facilities/${court.facility.id}/courts`);
    revalidatePath(
      `/dashboard/facilities/${court.facility.id}/courts/${data.courtId}/time-slots`,
    );

    return {
      success: true,
      created: newTimeSlots.count || nonOverlappingSlots.length,
      skipped: timeSlotsToCreate.length - nonOverlappingSlots.length,
    };
  } catch (error) {
    console.error("Failed to generate time slots:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate time slots",
    );
  }
}
