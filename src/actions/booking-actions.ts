"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export interface FacilityBooking {
  id: string;
  startTime: Date;
  endTime: Date;
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
  totalPrice: number;
  court: {
    id: string;
    name: string;
    sportType: string;
    facility: {
      name: string;
      address: string;
    };
  };
  player: {
    user: {
      name: string;
      email: string;
    };
    phoneNumber: string | null;
  };
  createdAt: Date;
}

/**
 * Get all bookings for facilities owned by the current user
 */
export async function getFacilityBookings(): Promise<FacilityBooking[]> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Get facilities owned by the current user
    const facilities = await prisma.facility.findMany({
      where: {
        owner: {
          userId: session.user.id,
        },
      },
      select: {
        id: true,
      },
    });

    const facilityIds = facilities.map((f) => f.id);

    if (facilityIds.length === 0) {
      return [];
    }

    // Get all bookings for the owner's facilities
    const bookings = await prisma.booking.findMany({
      where: {
        timeSlot: {
          court: {
            facilityId: {
              in: facilityIds,
            },
          },
        },
      },
      include: {
        timeSlot: {
          include: {
            court: {
              include: {
                facility: {
                  select: {
                    name: true,
                    address: true,
                  },
                },
              },
            },
          },
        },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to match the interface
    const transformedBookings: FacilityBooking[] = bookings.map((booking) => ({
      id: booking.id,
      startTime: booking.timeSlot.startTime,
      endTime: booking.timeSlot.endTime,
      status: booking.status,
      totalPrice: booking.totalPrice,
      court: {
        id: booking.timeSlot.court.id,
        name: booking.timeSlot.court.name,
        sportType: booking.timeSlot.court.sportType,
        facility: {
          name: booking.timeSlot.court.facility.name,
          address: booking.timeSlot.court.facility.address,
        },
      },
      player: {
        user: {
          name: booking.player.user.name,
          email: booking.player.user.email,
        },
        phoneNumber: booking.player.phoneNumber,
      },
      createdAt: booking.createdAt,
    }));

    return transformedBookings;
  } catch (error) {
    console.error("Error fetching facility bookings:", error);
    throw new Error("Failed to fetch bookings");
  }
}

/**
 * Get booking statistics for facility owner dashboard
 */
export async function getBookingStats(): Promise<{
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Get facilities owned by the current user
    const facilities = await prisma.facility.findMany({
      where: {
        owner: {
          userId: session.user.id,
        },
      },
      select: {
        id: true,
      },
    });

    const facilityIds = facilities.map((f) => f.id);

    if (facilityIds.length === 0) {
      return {
        totalBookings: 0,
        upcomingBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
      };
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all bookings for statistics
    const [
      totalBookings,
      upcomingBookings,
      completedBookings,
      cancelledBookings,
      revenueData,
      monthlyRevenueData,
    ] = await Promise.all([
      // Total bookings
      prisma.booking.count({
        where: {
          timeSlot: {
            court: {
              facilityId: {
                in: facilityIds,
              },
            },
          },
        },
      }),
      // Upcoming bookings
      prisma.booking.count({
        where: {
          timeSlot: {
            startTime: {
              gte: now,
            },
            court: {
              facilityId: {
                in: facilityIds,
              },
            },
          },
          status: "CONFIRMED",
        },
      }),
      // Completed bookings
      prisma.booking.count({
        where: {
          timeSlot: {
            court: {
              facilityId: {
                in: facilityIds,
              },
            },
          },
          status: "COMPLETED",
        },
      }),
      // Cancelled bookings
      prisma.booking.count({
        where: {
          timeSlot: {
            court: {
              facilityId: {
                in: facilityIds,
              },
            },
          },
          status: "CANCELLED",
        },
      }),
      // Total revenue
      prisma.booking.aggregate({
        where: {
          timeSlot: {
            court: {
              facilityId: {
                in: facilityIds,
              },
            },
          },
          status: {
            in: ["CONFIRMED", "COMPLETED"],
          },
        },
        _sum: {
          totalPrice: true,
        },
      }),
      // Monthly revenue
      prisma.booking.aggregate({
        where: {
          timeSlot: {
            court: {
              facilityId: {
                in: facilityIds,
              },
            },
          },
          status: {
            in: ["CONFIRMED", "COMPLETED"],
          },
          createdAt: {
            gte: startOfMonth,
          },
        },
        _sum: {
          totalPrice: true,
        },
      }),
    ]);

    return {
      totalBookings,
      upcomingBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue: revenueData._sum.totalPrice || 0,
      monthlyRevenue: monthlyRevenueData._sum.totalPrice || 0,
    };
  } catch (error) {
    console.error("Error fetching booking stats:", error);
    throw new Error("Failed to fetch booking statistics");
  }
}

/**
 * Update booking status (for facility owners)
 */
export async function updateBookingStatus(
  bookingId: string,
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED",
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Verify the booking belongs to the user's facility
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        timeSlot: {
          court: {
            facility: {
              owner: {
                userId: session.user.id,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new Error("Booking not found or unauthorized");
    }

    // Update the booking status
    await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw new Error("Failed to update booking status");
  }
}

/**
 * Cancel a booking (for players)
 */
export async function cancelPlayerBooking(bookingId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Get player profile
    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!playerProfile) {
      return { success: false, error: "Player profile not found" };
    }

    // Find the booking and verify ownership
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        playerId: playerProfile.id,
      },
      include: {
        timeSlot: {
          include: {
            court: {
              include: {
                facility: true,
              },
            },
          },
        },
        paymentOrder: true,
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    // Check if booking can be cancelled (not already cancelled or completed)
    if (booking.status === "CANCELLED") {
      return { success: false, error: "Booking is already cancelled" };
    }

    if (booking.status === "COMPLETED") {
      return { success: false, error: "Cannot cancel completed booking" };
    }

    // Check if booking is in the future (optional cancellation policy)
    const bookingDateTime = new Date(booking.timeSlot.startTime);
    const now = new Date();
    const minutesDifference =
      (bookingDateTime.getTime() - now.getTime()) / (1000 * 60);

    // Allow cancellation up to 30 minutes before the booking
    if (minutesDifference < 30) {
      return {
        success: false,
        error: "Cannot cancel booking less than 30 minutes before start time",
      };
    }

    // Update booking status to cancelled
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancellationReason: "Cancelled by player",
        updatedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return {
      success: false,
      error: "Failed to cancel booking. Please try again.",
    };
  }
}
