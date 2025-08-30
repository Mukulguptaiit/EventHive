import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { env } from "@/env";

/**
 * Webhook endpoint for Razorpay payment notifications
 * Handles payment success, failure, and other events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      console.error("Missing Razorpay signature");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("Invalid Razorpay webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    // Handle different webhook events
    switch (event.event) {
      case "payment.captured":
        await handlePaymentCaptured(event.payload.payment.entity);
        break;

      case "payment.failed":
        await handlePaymentFailed(event.payload.payment.entity);
        break;

      case "order.paid":
        await handleOrderPaid(event.payload.order.entity);
        break;

      default:
        console.log("Unhandled webhook event:", event.event);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Error processing Razorpay webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * Handle successful payment capture
 */
async function handlePaymentCaptured(payment: any) {
  try {
    const {
      id: razorpayPaymentId,
      order_id: razorpayOrderId,
      amount,
    } = payment;

    await prisma.$transaction(async (tx) => {
      // Find the payment order
      const paymentOrder = await tx.paymentOrder.findUnique({
        where: { razorpayOrderId },
        include: { bookingReservation: true },
      });

      if (!paymentOrder) {
        console.error("Payment order not found for webhook:", razorpayOrderId);
        return;
      }

      // Check if payment record already exists
      const existingPayment = await tx.payment.findUnique({
        where: { razorpayPaymentId },
      });

      if (existingPayment) {
        return;
      }

      // Create or update payment record
      await tx.payment.create({
        data: {
          paymentOrderId: paymentOrder.id,
          razorpayPaymentId,
          amount: amount / 100, // Convert from paise to rupees
          currency: "INR",
          status: "SUCCESSFUL",
          method: payment.method || "unknown",
          razorpayResponse: payment,
          isSignatureVerified: true,
          verifiedAt: new Date(),
        },
      });

      // Only proceed if payment order is still pending
      if (paymentOrder.status === "PENDING") {
        // Check if reservation is still valid
        if (paymentOrder.bookingReservation?.status === "RESERVED") {
          // Create bookings for each slot
          await Promise.all(
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

              if (!existingConfirmedBooking) {
                await tx.booking.create({
                  data: {
                    timeSlotId,
                    courtId: timeSlot.courtId,
                    playerId: paymentOrder.playerId,
                    totalPrice:
                      paymentOrder.totalPrice / paymentOrder.timeSlotIds.length,
                    status: "CONFIRMED",
                    paymentOrderId: paymentOrder.id,
                  },
                });
              } else {
                console.log(`Booking already exists for slot ${timeSlotId}`);
              }
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
        }
      }
    });

    console.log("Payment captured successfully:", razorpayPaymentId);
  } catch (error) {
    console.error("Error handling payment captured:", error);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(payment: any) {
  try {
    const {
      id: razorpayPaymentId,
      order_id: razorpayOrderId,
      error_description,
    } = payment;

    await prisma.$transaction(async (tx) => {
      // Find the payment order
      const paymentOrder = await tx.paymentOrder.findUnique({
        where: { razorpayOrderId },
        include: { bookingReservation: true },
      });

      if (!paymentOrder) {
        console.error(
          "Payment order not found for failed payment:",
          razorpayOrderId,
        );
        return;
      }

      // Create payment record with failed status
      const existingPayment = await tx.payment.findUnique({
        where: { razorpayPaymentId },
      });

      if (!existingPayment) {
        await tx.payment.create({
          data: {
            paymentOrderId: paymentOrder.id,
            razorpayPaymentId,
            amount: payment.amount / 100, // Convert from paise to rupees
            currency: "INR",
            status: "FAILED",
            method: payment.method || "unknown",
            razorpayResponse: payment,
            failureReason: error_description,
          },
        });
      }

      // Update payment order status if still pending
      if (paymentOrder.status === "PENDING") {
        await tx.paymentOrder.update({
          where: { id: paymentOrder.id },
          data: { status: "FAILED" },
        });

        // Cancel reservation if exists
        if (paymentOrder.bookingReservation) {
          await tx.bookingReservation.update({
            where: { paymentOrderId: paymentOrder.id },
            data: { status: "CANCELLED" },
          });
        }
      }
    });

    console.log("Payment failed processed:", razorpayPaymentId);
  } catch (error) {
    console.error("Error handling payment failed:", error);
  }
}

/**
 * Handle order paid event (when entire order is paid)
 */
async function handleOrderPaid(order: any) {
  try {
    const { id: razorpayOrderId, amount, amount_paid } = order;

    console.log("Order paid:", razorpayOrderId, { amount, amount_paid });
  } catch (error) {
    console.error("Error handling order paid:", error);
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
