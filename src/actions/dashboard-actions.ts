"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { SportType } from "@/types/venue";

/**
 * Get dashboard statistics for a facility owner
 */
export async function getFacilityOwnerStats(facilityId?: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // Get player profile to check role
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

    // Build where clause based on user role
    const whereClause: any = {};

    if (playerProfile.role === "FACILITY_OWNER") {
      // Facility owners can only see their own facilities
      whereClause.ownerId = playerProfile.id;
    }

    if (facilityId) {
      whereClause.id = facilityId;
    }

    // Get facilities owned by the user
    const facilities = await prisma.facility.findMany({
      where: whereClause,
      include: {
        courts: {
          include: {
            bookings: {
              where: {
                createdAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                },
              },
            },
          },
        },
        _count: {
          select: {
            courts: { where: { isActive: true } },
            reviews: true,
          },
        },
      },
    });

    // Calculate aggregate statistics
    let totalBookings = 0;
    let confirmedBookings = 0;
    let cancelledBookings = 0;
    let completedBookings = 0;
    let totalRevenue = 0;
    let activeCourts = 0;
    const totalFacilities = facilities.length;
    let averageRating = 0;
    let totalReviews = 0;

    const sportTypeStats: Record<SportType, number> = {
      BADMINTON: 0,
      TENNIS: 0,
      SQUASH: 0,
      BASKETBALL: 0,
      FOOTBALL: 0,
      CRICKET: 0,
      TABLE_TENNIS: 0,
      VOLLEYBALL: 0,
    };

    for (const facility of facilities) {
      activeCourts += facility._count.courts;
      totalReviews += facility._count.reviews;
      if (facility.rating) {
        averageRating += facility.rating;
      }

      for (const court of facility.courts) {
        sportTypeStats[court.sportType]++;

        for (const booking of court.bookings) {
          totalBookings++;

          if (booking.status === "CONFIRMED") {
            confirmedBookings++;
            totalRevenue += booking.totalPrice;
          } else if (booking.status === "CANCELLED") {
            cancelledBookings++;
          } else if (booking.status === "COMPLETED") {
            completedBookings++;
            totalRevenue += booking.totalPrice;
          }
        }
      }
    }

    averageRating = totalFacilities > 0 ? averageRating / totalFacilities : 0;

    return {
      overview: {
        totalFacilities,
        activeCourts,
        totalBookings,
        totalRevenue,
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews,
      },
      bookingStats: {
        confirmed: confirmedBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
        total: totalBookings,
      },
      sportTypeStats,
      facilities: facilities.map((facility) => ({
        id: facility.id,
        name: facility.name,
        status: facility.status,
        courtsCount: facility._count.courts,
        rating: facility.rating,
        reviewCount: facility._count.reviews,
      })),
    };
  } catch (error) {
    console.error("Error fetching facility owner stats:", error);
    throw new Error("Failed to fetch dashboard statistics");
  }
}

/**
 * Get booking trends data for charts
 */
export async function getBookingTrends(facilityId?: string, days = 30) {
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

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get facilities owned by the user
    const whereClause: any = {};
    if (playerProfile.role === "FACILITY_OWNER") {
      whereClause.ownerId = playerProfile.id;
    }
    if (facilityId) {
      whereClause.id = facilityId;
    }

    const facilities = await prisma.facility.findMany({
      where: whereClause,
      include: {
        courts: {
          include: {
            bookings: {
              where: {
                createdAt: { gte: startDate },
              },
              select: {
                createdAt: true,
                totalPrice: true,
                status: true,
              },
            },
          },
        },
      },
    });

    // Group bookings by date
    const dailyStats: Record<
      string,
      { bookings: number; revenue: number; cancelled: number }
    > = {};

    for (const facility of facilities) {
      for (const court of facility.courts) {
        for (const booking of court.bookings) {
          const dateKey = booking.createdAt.toISOString().split("T")[0];

          if (!dailyStats[dateKey]) {
            dailyStats[dateKey] = { bookings: 0, revenue: 0, cancelled: 0 };
          }

          dailyStats[dateKey].bookings++;

          if (
            booking.status === "COMPLETED" ||
            booking.status === "CONFIRMED"
          ) {
            dailyStats[dateKey].revenue += booking.totalPrice;
          } else if (booking.status === "CANCELLED") {
            dailyStats[dateKey].cancelled++;
          }
        }
      }
    }

    // Convert to array and fill missing dates
    const trends = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split("T")[0];

      trends.push({
        date: dateKey,
        bookings: dailyStats[dateKey]?.bookings || 0,
        revenue: dailyStats[dateKey]?.revenue || 0,
        cancelled: dailyStats[dateKey]?.cancelled || 0,
      });
    }

    return trends;
  } catch (error) {
    console.error("Error fetching booking trends:", error);
    throw new Error("Failed to fetch booking trends");
  }
}

/**
 * Get peak hours data for heatmap
 */
export async function getPeakHoursData(facilityId?: string) {
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
    if (facilityId) {
      whereClause.id = facilityId;
    }

    const facilities = await prisma.facility.findMany({
      where: whereClause,
      include: {
        courts: {
          include: {
            timeSlots: {
              where: {
                bookings: {
                  some: {
                    status: "COMPLETED",
                  },
                },
                startTime: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
              },
              select: {
                startTime: true,
              },
            },
          },
        },
      },
    });

    // Initialize heatmap data: 7 days × 24 hours
    const heatmapData: Record<string, Record<number, number>> = {};
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    dayNames.forEach((day) => {
      heatmapData[day] = {};
      for (let hour = 0; hour < 24; hour++) {
        heatmapData[day][hour] = 0;
      }
    });

    // Count bookings by day of week and hour
    for (const facility of facilities) {
      for (const court of facility.courts) {
        for (const timeSlot of court.timeSlots) {
          const dayOfWeek = timeSlot.startTime.getDay();
          const hour = timeSlot.startTime.getHours();
          const dayName = dayNames[dayOfWeek];

          heatmapData[dayName][hour]++;
        }
      }
    }

    // Convert to array format for chart
    const chartData = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourData: any = { hour: `${hour}:00` };
      dayNames.forEach((day) => {
        hourData[day] = heatmapData[day][hour];
      });
      chartData.push(hourData);
    }

    return chartData;
  } catch (error) {
    console.error("Error fetching peak hours data:", error);
    throw new Error("Failed to fetch peak hours data");
  }
}

/**
 * Get recent bookings for overview
 */
export async function getRecentBookings(facilityId?: string, limit = 10) {
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
      whereClause.court = {
        facility: {
          ownerId: playerProfile.id,
        },
      };
    }
    if (facilityId) {
      whereClause.court = {
        ...whereClause.court,
        facilityId,
      };
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
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
        court: {
          select: {
            name: true,
            sportType: true,
            facility: {
              select: {
                name: true,
              },
            },
          },
        },
        timeSlot: {
          select: {
            startTime: true,
            endTime: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return bookings.map((booking) => ({
      id: booking.id,
      playerName: booking.player.user.name,
      playerEmail: booking.player.user.email,
      facilityName: booking.court.facility.name,
      courtName: booking.court.name,
      sportType: booking.court.sportType,
      startTime: booking.timeSlot.startTime.toISOString(),
      endTime: booking.timeSlot.endTime.toISOString(),
      totalPrice: booking.totalPrice,
      status: booking.status,
      createdAt: booking.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching recent bookings:", error);
    throw new Error("Failed to fetch recent bookings");
  }
}
