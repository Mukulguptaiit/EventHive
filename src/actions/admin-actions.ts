"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

// Utility function to check admin permissions
async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/login");
  }

  const playerProfile = await prisma.playerProfile.findUnique({
    where: { userId: session.user.id },
    select: { role: true },
  });

  if (playerProfile?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return session.user;
}

// Helper function to calculate percentage change
function calculatePercentageChange(current: number, previous: number): string {
  if (previous === 0) {
    return current > 0 ? "+100%" : "No change";
  }
  const change = ((current - previous) / previous) * 100;
  const formatted = Math.abs(change).toFixed(1);
  if (change > 0) {
    return `+${formatted}%`;
  } else if (change < 0) {
    return `-${formatted}%`;
  } else {
    return "No change";
  }
}

// Global Stats Functions
export async function getGlobalStats() {
  await requireAdmin();

  try {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get current totals
    const [
      totalUsers,
      totalFacilityOwners,
      totalBookings,
      totalActiveCourts,
      pendingFacilities,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.playerProfile.count({
        where: { role: "FACILITY_OWNER" },
      }),
      prisma.booking.count(),
      prisma.court.count({
        where: { isActive: true },
      }),
      prisma.facility.count({
        where: { status: "PENDING" },
      }),
    ]);

    // Get last month's totals for trend calculation
    const [
      lastMonthUsers,
      lastMonthFacilityOwners,
      lastMonthBookings,
      lastMonthCourts,
    ] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { lt: startOfCurrentMonth } },
      }),
      prisma.playerProfile.count({
        where: {
          role: "FACILITY_OWNER",
          createdAt: { lt: startOfCurrentMonth },
        },
      }),
      prisma.booking.count({
        where: { createdAt: { lt: startOfCurrentMonth } },
      }),
      prisma.court.count({
        where: {
          isActive: true,
          createdAt: { lt: startOfCurrentMonth },
        },
      }),
    ]);

    return {
      totalUsers,
      totalFacilityOwners,
      totalBookings,
      totalActiveCourts,
      pendingFacilities,
      trends: {
        usersTrend: calculatePercentageChange(totalUsers, lastMonthUsers),
        facilityOwnersTrend: calculatePercentageChange(
          totalFacilityOwners,
          lastMonthFacilityOwners,
        ),
        bookingsTrend: calculatePercentageChange(
          totalBookings,
          lastMonthBookings,
        ),
        courtsTrend: calculatePercentageChange(
          totalActiveCourts,
          lastMonthCourts,
        ),
        pendingTrend:
          pendingFacilities > 0 ? "Requires attention" : "All caught up!",
      },
    };
  } catch (error) {
    console.error("Error fetching global stats:", error);
    throw new Error("Failed to fetch global stats");
  }
}

// Chart Data Functions
export async function getBookingActivityData() {
  await requireAdmin();

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const bookings = await prisma.booking.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group by day
    const dailyBookings = bookings.reduce(
      (acc, booking) => {
        const date = booking.createdAt.toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + booking._count.id;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Fill in missing days with 0
    const result = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      result.push({
        date: dateStr,
        bookings: dailyBookings[dateStr] || 0,
      });
    }

    return result;
  } catch (error) {
    console.error("Error fetching booking activity data:", error);
    throw new Error("Failed to fetch booking activity data");
  }
}

export async function getUserRegistrationTrends() {
  await requireAdmin();

  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group by month
    const monthlyRegistrations = users.reduce(
      (acc, user) => {
        const month = user.createdAt.toISOString().substring(0, 7); // YYYY-MM
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Fill in missing months with 0
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toISOString().substring(0, 7);
      result.push({
        month: monthStr,
        registrations: monthlyRegistrations[monthStr] || 0,
      });
    }

    return result;
  } catch (error) {
    console.error("Error fetching user registration trends:", error);
    throw new Error("Failed to fetch user registration trends");
  }
}

export async function getFacilityApprovalTrends() {
  await requireAdmin();

  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const facilities = await prisma.facility.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        createdAt: true,
        status: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group by month and status
    const monthlyData = facilities.reduce(
      (acc, facility) => {
        const month = facility.createdAt.toISOString().substring(0, 7);
        if (!acc[month]) {
          acc[month] = { pending: 0, approved: 0, rejected: 0 };
        }
        acc[month][
          facility.status.toLowerCase() as keyof (typeof acc)[string]
        ]++;
        return acc;
      },
      {} as Record<
        string,
        { pending: number; approved: number; rejected: number }
      >,
    );

    // Fill in missing months
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toISOString().substring(0, 7);
      result.push({
        month: monthStr,
        pending: monthlyData[monthStr]?.pending || 0,
        approved: monthlyData[monthStr]?.approved || 0,
        rejected: monthlyData[monthStr]?.rejected || 0,
      });
    }

    return result;
  } catch (error) {
    console.error("Error fetching facility approval trends:", error);
    throw new Error("Failed to fetch facility approval trends");
  }
}

export async function getMostActiveSports() {
  await requireAdmin();

  try {
    const courts = await prisma.court.groupBy({
      by: ["sportType"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    return courts.map((court) => ({
      sport: court.sportType,
      count: court._count.id,
    }));
  } catch (error) {
    console.error("Error fetching most active sports:", error);
    throw new Error("Failed to fetch most active sports");
  }
}

// Facility Approval Functions
export async function getPendingFacilities() {
  await requireAdmin();

  try {
    const facilities = await prisma.facility.findMany({
      where: { status: "PENDING" },
      include: {
        owner: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        courts: {
          select: {
            id: true,
            name: true,
            sportType: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return facilities;
  } catch (error) {
    console.error("Error fetching pending facilities:", error);
    throw new Error("Failed to fetch pending facilities");
  }
}

export async function approveFacility(facilityId: string, comments?: string) {
  const user = await requireAdmin();

  try {
    const facility = await prisma.facility.update({
      where: { id: facilityId },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        approvedBy: user.id,
        rejectionReason: comments || null,
      },
    });

    revalidatePath("/admin/facilities");
    return { success: true, facility };
  } catch (error) {
    console.error("Error approving facility:", error);
    throw new Error("Failed to approve facility");
  }
}

export async function rejectFacility(facilityId: string, reason: string) {
  const user = await requireAdmin();

  try {
    const facility = await prisma.facility.update({
      where: { id: facilityId },
      data: {
        status: "REJECTED",
        approvedBy: user.id,
        rejectionReason: reason,
      },
    });

    revalidatePath("/admin/facilities");
    return { success: true, facility };
  } catch (error) {
    console.error("Error rejecting facility:", error);
    throw new Error("Failed to reject facility");
  }
}

// User Management Functions
export async function getAllUsers(search?: string, roleFilter?: string) {
  await requireAdmin();

  try {
    const where = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { email: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {},
        roleFilter && roleFilter !== "ALL"
          ? {
              playerProfile: {
                role: roleFilter as any,
              },
            }
          : {},
      ],
    };

    const users = await prisma.user.findMany({
      where,
      include: {
        playerProfile: {
          select: {
            id: true,
            role: true,
            phoneNumber: true,
            isActive: true,
            isBanned: true,
            bannedUntil: true,
            _count: {
              select: {
                bookings: true,
                ownedFacilities: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}

export async function banUser(
  userId: string,
  banUntil?: Date,
  _reason?: string,
) {
  await requireAdmin();

  try {
    const playerProfile = await prisma.playerProfile.update({
      where: { userId },
      data: {
        isBanned: true,
        bannedUntil: banUntil || null,
      },
    });

    revalidatePath("/admin/users");
    return { success: true, playerProfile };
  } catch (error) {
    console.error("Error banning user:", error);
    throw new Error("Failed to ban user");
  }
}

export async function unbanUser(userId: string) {
  await requireAdmin();

  try {
    const playerProfile = await prisma.playerProfile.update({
      where: { userId },
      data: {
        isBanned: false,
        bannedUntil: null,
      },
    });

    revalidatePath("/admin/users");
    return { success: true, playerProfile };
  } catch (error) {
    console.error("Error unbanning user:", error);
    throw new Error("Failed to unban user");
  }
}

export async function getUserBookingHistory(userId: string) {
  await requireAdmin();

  try {
    const bookings = await prisma.booking.findMany({
      where: { playerId: userId },
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
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit to last 50 bookings
    });

    return bookings;
  } catch (error) {
    console.error("Error fetching user booking history:", error);
    throw new Error("Failed to fetch user booking history");
  }
}
