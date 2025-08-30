"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PaymentStatus, BookingStatus } from "@/generated/prisma";
import { headers } from "next/headers";
import crypto from "crypto"; // Only for generating random IDs, not signature checks

export interface CreatePaymentOrderData {
  eventId: string;
  ticketId: string;
  quantity: number;
  totalAmount: number;
  currency?: string;
}

export interface CreatePaymentOrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

export interface VerifyPaymentResult {
  success: boolean;
  bookingId?: string;
  error?: string;
}

export async function createPaymentOrder(
  data: CreatePaymentOrderData
): Promise<CreatePaymentOrderResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate ticket availability
    const ticket = await prisma.ticket.findUnique({
      where: { id: data.ticketId },
      include: { event: true }
    });

    if (!ticket) {
      return { success: false, error: "Ticket not found" };
    }

    if (!ticket.isActive) {
      return { success: false, error: "Ticket is not available" };
    }

    if (ticket.availableQuantity < data.quantity) {
      return { success: false, error: "Not enough tickets available" };
    }

  // Generate an internal order id (no external gateway)
  const internalOrderId = `order_${crypto.randomBytes(8).toString("hex")}`;
  const receipt = `event_${Date.now()}`;

    // Create payment order in database
  const paymentOrder = await prisma.paymentOrder.create({
      data: {
    // Use the generic id field and save the internalOrderId in receipt/response for traceability
    amount: Math.round(data.totalAmount * 100),
    currency: data.currency || "INR",
    receipt,
        status: "PENDING",
        userId: session.user.id,
        eventId: data.eventId,
        ticketId: data.ticketId,
        quantity: data.quantity,
        totalAmount: data.totalAmount,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    razorpayResponse: { id: internalOrderId, provider: "internal" } as any
      }
    });

    revalidatePath("/dashboard/bookings");
    revalidatePath("/events/[eventId]");

  return { success: true, orderId: paymentOrder.id };
  } catch (error) {
    console.error("Error creating payment order:", error);
    return { success: false, error: "Failed to create payment order" };
  }
}

// Mark the internal order as paid and create booking
export async function confirmInternalPayment(orderId: string): Promise<VerifyPaymentResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

  // No external gateway: accept the payment as successful when called

    // Process payment in transaction
    const result = await prisma.$transaction(async (tx) => {
      const paymentOrder = await tx.paymentOrder.findUnique({
        where: { id: orderId },
        include: { event: true, ticket: true }
      });

      if (!paymentOrder) {
        throw new Error("Payment order not found");
      }

      if (paymentOrder.userId !== session.user.id) {
        throw new Error("Unauthorized payment verification");
      }

      if (paymentOrder.status !== "PENDING") {
        throw new Error("Payment order is not pending");
      }

      if (paymentOrder.expiresAt < new Date()) {
        throw new Error("Payment order has expired");
      }

      // Check if tickets are still available
      const ticket = await tx.ticket.findUnique({
        where: { id: paymentOrder.ticketId }
      });

      if (!ticket || !ticket.isActive) {
        throw new Error("Ticket is no longer available");
      }

      if (ticket.availableQuantity < paymentOrder.quantity) {
        throw new Error("Not enough tickets available");
      }

    // Create payment record
    await tx.payment.create({
        data: {
          paymentOrderId: paymentOrder.id,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency,
          status: "SUCCESSFUL",
      method: "internal",
          isSignatureVerified: true,
          verifiedAt: new Date()
        }
      });

      // Update payment order status
      await tx.paymentOrder.update({
        where: { id: paymentOrder.id },
        data: {
          status: "SUCCESSFUL",
          razorpayResponse: { provider: "internal", status: "paid" }
        }
      });

      // Create booking
      const booking = await tx.booking.create({
        data: {
          eventId: paymentOrder.eventId,
          ticketId: paymentOrder.ticketId,
          userId: paymentOrder.userId,
          organizerId: paymentOrder.event.organizerId,
          quantity: paymentOrder.quantity,
          totalAmount: paymentOrder.totalAmount,
          currency: paymentOrder.currency,
          status: "CONFIRMED",
          paymentOrderId: paymentOrder.id,
          paymentStatus: "SUCCESSFUL",
          attendeeName: session.user.name || "Anonymous",
          attendeeEmail: session.user.email || "",
          attendeePhone: undefined,
          specialRequests: undefined
        }
      });

      // Update ticket availability
      await tx.ticket.update({
        where: { id: paymentOrder.ticketId },
        data: {
          soldQuantity: { increment: paymentOrder.quantity },
          availableQuantity: { decrement: paymentOrder.quantity }
        }
      });

      // Update event attendee count
      await tx.event.update({
        where: { id: paymentOrder.eventId },
        data: {
          currentAttendees: { increment: paymentOrder.quantity }
        }
      });

      return { success: true, bookingId: booking.id };
    });

    revalidatePath("/dashboard/bookings");
    revalidatePath("/events/[eventId]");

    return result;
  } catch (error) {
    console.error("Error verifying payment:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to confirm payment" };
  }
}

export async function handlePaymentFailure(orderId: string): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await prisma.$transaction(async (tx) => {
      const paymentOrder = await tx.paymentOrder.findUnique({
        where: { id: orderId }
      });

      if (!paymentOrder) {
        throw new Error("Payment order not found");
      }

      if (paymentOrder.userId !== session.user.id) {
        throw new Error("Unauthorized");
      }

      // Update payment order status
      await tx.paymentOrder.update({
        where: { id: paymentOrder.id },
        data: { status: "FAILED" }
      });

      // Create failed payment record
    await tx.payment.create({
        data: {
          paymentOrderId: paymentOrder.id,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency,
          status: "FAILED",
          failureReason: "Payment failed",
      razorpayResponse: { orderId, provider: "internal" }
        }
      });
    });

    revalidatePath("/dashboard/bookings");
  } catch (error) {
    console.error("Error handling payment failure:", error);
  }
}

export async function getPaymentOrder(orderId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return null;
    }

    return await prisma.paymentOrder.findFirst({
      where: {
        id: orderId,
        userId: session.user.id
      },
      include: {
        event: true,
        ticket: true,
        payments: true
      }
    });
  } catch (error) {
    console.error("Error fetching payment order:", error);
    return null;
  }
}

export async function cancelPaymentOrder(orderId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const paymentOrder = await prisma.paymentOrder.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
        status: "PENDING"
      }
    });

    if (!paymentOrder) {
      return { success: false, error: "Payment order not found or cannot be cancelled" };
    }

    await prisma.paymentOrder.update({
      where: { id: orderId },
      data: { status: "CANCELLED" }
    });

    revalidatePath("/dashboard/bookings");
    return { success: true };
  } catch (error) {
    console.error("Error cancelling payment order:", error);
    return { success: false, error: "Failed to cancel payment order" };
  }
}

// Cleanup expired pending payment orders to free held inventory
export async function cleanupExpiredReservations() {
  try {
    const now = new Date();
    const expired = await prisma.paymentOrder.findMany({
      where: { status: "PENDING", expiresAt: { lt: now } },
      include: { ticket: true },
    });

    for (const po of expired) {
      // Mark order as cancelled
      await prisma.paymentOrder.update({
        where: { id: po.id },
        data: { status: "CANCELLED" },
      });
    }

    return { success: true, count: expired.length };
  } catch (error) {
    console.error("Error cleaning expired reservations:", error);
    return { success: false };
  }
}
