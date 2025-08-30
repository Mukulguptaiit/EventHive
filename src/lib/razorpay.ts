import Razorpay from "razorpay";
import { env } from "@/env";

/**
 * Razorpay client instance for server-side operations
 */
export const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

/**
 * Razorpay configuration for client-side operations
 */
export const razorpayConfig = {
  key_id: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
};

/**
 * Webhook secret for payment verification
 */
export const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET;
