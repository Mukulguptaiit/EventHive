"use server";

import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { env } from "@/env";

export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  razorpayOrderId?: string;
  reservationId?: string;
  error?: string;
}

export interface VerifyPaymentResult {
  success: boolean;
  bookingId?: string;
  error?: string;
}

export interface BookingSlot {
  timeSlotId: string;
  startTime: string;
  endTime: string;
  date: string;
}

/**
 * Creates a Razorpay order and reserves slots to prevent race conditions
 */
export async function createPaymentOrder(
  venueId: string,
  courtId: string,
  slots: BookingSlot[],
  totalAmount: number,
): Promise<CreateOrderResult> {
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

    // Start a database transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Check if any slots are already booked
      const existingBookings = await tx.booking.findMany({
        where: {
          courtId,
          timeSlotId: { in: slots.map((s) => s.timeSlotId) },
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
      });

      if (existingBookings.length > 0) {
        throw new Error("One or more time slots are already booked");
      }

      // Check for active reservations
      const activeReservations = await tx.bookingReservation.findMany({
        where: {
          timeSlotIds: { hasSome: slots.map((s) => s.timeSlotId) },
          status: "RESERVED",
          expiresAt: { gt: new Date() },
        },
      });

      if (activeReservations.length > 0) {
        throw new Error(
          "One or more time slots are currently being booked by another user",
        );
      }

      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100), // Convert to paise
        currency: "INR",
        receipt: `order_${Date.now()}`,
        notes: {
          venueId,
          courtId,
          playerId: playerProfile.id,
          slotCount: slots.length.toString(),
        },
      });

      // Create payment order record
      const paymentOrder = await tx.paymentOrder.create({
        data: {
          razorpayOrderId: razorpayOrder.id,
          amount: totalAmount,
          currency: "INR",
          receipt: razorpayOrder.receipt,
          status: "PENDING",
          playerId: playerProfile.id,
          timeSlotIds: slots.map((s) => s.timeSlotId),
          totalPrice: totalAmount,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        },
      });

      // Create slot reservation with 15-minute expiry
      const reservation = await tx.bookingReservation.create({
        data: {
          paymentOrderId: paymentOrder.id,
          timeSlotIds: slots.map((s) => s.timeSlotId),
          playerId: playerProfile.id,
          status: "RESERVED",
          totalPrice: totalAmount,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });

      return {
        orderId: paymentOrder.id,
        razorpayOrderId: razorpayOrder.id,
        reservationId: reservation.id,
      };
    });

    return { success: true, ...result };
  } catch (error) {
    console.error("Error creating payment order:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create payment order",
    };
  }
}

/**
 * Verifies Razorpay payment signature and creates booking
 */
export async function verifyPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
): Promise<VerifyPaymentResult> {
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

    // Verify signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return { success: false, error: "Invalid payment signature" };
    }

    // Process payment in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Find the payment order
      const paymentOrder = await tx.paymentOrder.findUnique({
        where: { razorpayOrderId },
        include: { bookingReservation: true },
      });

      if (!paymentOrder) {
        throw new Error("Payment order not found");
      }

      if (paymentOrder.status === "SUCCESSFUL") {
        // Payment already processed successfully, find the booking
        const existingBooking = await tx.booking.findFirst({
          where: {
            paymentOrderId: paymentOrder.id,
            status: "CONFIRMED", // Only look for confirmed bookings
          },
        });

        if (existingBooking) {
          return existingBooking.id;
        } else {
          // Check if webhook is still processing - look for any booking with this payment order
          const anyBooking = await tx.booking.findFirst({
            where: { paymentOrderId: paymentOrder.id },
          });

          if (anyBooking) {
            // Booking exists but might be in different state
            return anyBooking.id;
          } else {
            // This is a legitimate race condition - webhook might not have completed yet
            // Instead of throwing error, let's try to create the booking ourselves
            console.log(
              "Payment successful but no booking found, attempting to create booking",
            );
            // Fall through to normal booking creation process
          }
        }
      }

      // Allow SUCCESSFUL status to fall through for race condition handling
      if (
        paymentOrder.status !== "PENDING" &&
        paymentOrder.status !== "PROCESSING" &&
        paymentOrder.status !== "SUCCESSFUL"
      ) {
        throw new Error(
          `Payment order status is ${paymentOrder.status}, cannot verify`,
        );
      }

      // Update status to PROCESSING to prevent race conditions (unless already SUCCESSFUL)
      if (paymentOrder.status !== "SUCCESSFUL") {
        await tx.paymentOrder.update({
          where: { id: paymentOrder.id },
          data: { status: "PROCESSING" },
        });
      }

      if (paymentOrder.playerId !== playerProfile.id) {
        throw new Error("Unauthorized payment verification");
      }

      if (paymentOrder.expiresAt < new Date()) {
        throw new Error("Payment order has expired");
      }

      // Check if reservation is still valid
      if (!paymentOrder.bookingReservation) {
        throw new Error("No reservation found for this payment order");
      }

      if (paymentOrder.bookingReservation.status !== "RESERVED") {
        throw new Error("Reservation is no longer valid");
      }

      if (paymentOrder.bookingReservation.expiresAt < new Date()) {
        throw new Error("Reservation has expired");
      }

      // Double-check no bookings exist for these slots
      const conflictingBookings = await tx.booking.findMany({
        where: {
          timeSlotId: { in: paymentOrder.timeSlotIds },
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
      });

      if (conflictingBookings.length > 0) {
        throw new Error("Slots are no longer available");
      }

      // Create payment record
      await tx.payment.create({
        data: {
          paymentOrderId: paymentOrder.id,
          razorpayPaymentId,
          razorpaySignature,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency,
          status: "SUCCESSFUL",
          isSignatureVerified: true,
          verifiedAt: new Date(),
        },
      });

      // Create bookings for each slot
      const bookings = await Promise.all(
        paymentOrder.timeSlotIds.map(async (timeSlotId) => {
          // Get the time slot to find the court ID
          const timeSlot = await tx.timeSlot.findUnique({
            where: { id: timeSlotId },
            select: { courtId: true },
          });

          if (!timeSlot) {
            throw new Error(`Time slot ${timeSlotId} not found`);
          }

          // Check if there's already a confirmed booking for this time slot
          const existingConfirmedBooking = await tx.booking.findFirst({
            where: {
              timeSlotId,
              status: "CONFIRMED",
            },
          });

          if (existingConfirmedBooking) {
            throw new Error(`Time slot ${timeSlotId} is already booked`);
          }

          // Create new booking (allows multiple bookings per slot, keeping cancelled ones as history)
          return tx.booking.create({
            data: {
              timeSlotId,
              courtId: timeSlot.courtId,
              playerId: playerProfile.id,
              totalPrice:
                paymentOrder.totalPrice / paymentOrder.timeSlotIds.length,
              status: "CONFIRMED",
              paymentOrderId: paymentOrder.id,
            },
          });
        }),
      );

      // Update payment order status
      await tx.paymentOrder.update({
        where: { id: paymentOrder.id },
        data: { status: "SUCCESSFUL" },
      });

      // Mark reservation as confirmed
      await tx.bookingReservation.update({
        where: { paymentOrderId: paymentOrder.id },
        data: {
          status: "CONFIRMED",
          confirmedAt: new Date(),
        },
      });

      return bookings[0]?.id;
    });

    // Revalidate relevant pages
    revalidatePath("/dashboard");
    revalidatePath("/venues");

    return { success: true, bookingId: result };
  } catch (error) {
    console.error("Error verifying payment:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Payment verification failed",
    };
  }
}

/**
 * Handles payment failure and cleanup
 */
export async function handlePaymentFailure(
  razorpayOrderId: string,
): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      const paymentOrder = await tx.paymentOrder.findUnique({
        where: { razorpayOrderId },
        include: { bookingReservation: true },
      });

      if (!paymentOrder) {
        return;
      }

      // Mark payment order as failed
      await tx.paymentOrder.update({
        where: { id: paymentOrder.id },
        data: { status: "FAILED" },
      });

      // Mark reservation as cancelled if it exists
      if (paymentOrder.bookingReservation) {
        await tx.bookingReservation.update({
          where: { paymentOrderId: paymentOrder.id },
          data: { status: "CANCELLED" },
        });
      }
    });
  } catch (error) {
    console.error("Error handling payment failure:", error);
  }
}

/**
 * Cancels expired reservations and payment orders
 */
export async function cleanupExpiredReservations(): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      const expiredTime = new Date();

      // Find expired reservations
      const expiredReservations = await tx.bookingReservation.findMany({
        where: {
          status: "RESERVED",
          expiresAt: { lt: expiredTime },
        },
      });

      if (expiredReservations.length === 0) {
        return;
      }

      // Mark reservations as expired
      await tx.bookingReservation.updateMany({
        where: {
          status: "RESERVED",
          expiresAt: { lt: expiredTime },
        },
        data: { status: "EXPIRED" },
      });

      // Mark associated payment orders as failed
      const expiredOrderIds = expiredReservations.map((r) => r.paymentOrderId);

      if (expiredOrderIds.length > 0) {
        await tx.paymentOrder.updateMany({
          where: {
            id: { in: expiredOrderIds },
            status: "PENDING",
          },
          data: { status: "FAILED" },
        });
      }
    });
  } catch (error) {
    console.error("Error cleaning up expired reservations:", error);
  }
}
