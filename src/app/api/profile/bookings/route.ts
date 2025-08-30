import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's player profile
    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!playerProfile) {
      return NextResponse.json({ bookings: [] });
    }

    // Fetch user's bookings
    const bookings = await prisma.booking.findMany({
      where: {
        playerId: playerProfile.id,
      },
      include: {
        timeSlot: {
          include: {
            court: {
              select: {
                id: true,
                name: true,
                sportType: true,
                facilityId: true,
                facility: {
                  select: {
                    id: true,
                    name: true,
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
    });

    // Transform bookings to match the frontend format
    const transformedBookings = bookings.map((booking) => ({
      id: booking.id,
      venue: booking.timeSlot.court.facility.name,
      sport: booking.timeSlot.court.sportType, // Use sportType enum
      court: booking.timeSlot.court.name,
      date: booking.timeSlot.startTime,
      startTime: booking.timeSlot.startTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      endTime: booking.timeSlot.endTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      status: booking.status,
      price: booking.totalPrice, // Use totalPrice instead of totalAmount
      createdAt: booking.createdAt,
      bookingDate: booking.timeSlot.startTime,
      timeSlotId: booking.timeSlotId,
      courtId: booking.timeSlot.courtId,
      facilityId: booking.timeSlot.court.facilityId,
    }));

    return NextResponse.json({
      bookings: transformedBookings,
      totalBookings: transformedBookings.length,
      totalSpent: transformedBookings
        .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
        .reduce((sum, b) => sum + b.price, 0),
      completedBookings: transformedBookings.filter(
        (b) => b.status === "COMPLETED",
      ).length,
      activeBookings: transformedBookings.filter(
        (b) => b.status === "CONFIRMED",
      ).length,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 },
    );
  }
}
