import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.string().url(),
    DATABASE_URL: z.string(),
    EMAILJS_SERVICE_ID: z.string(),
    EMAILJS_TEMPLATE_ID: z.string(),
    EMAILJS_PUBLIC_KEY: z.string(),
    EMAILJS_PRIVATE_KEY: z.string(),
    NEXT_PUBLIC_EMAILJS_SERVICE_ID: z.string(),
    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID: z.string(),
    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: z.string(),
    // RAZORPAY_KEY_SECRET: z.string(),
    // RAZORPAY_WEBHOOK_SECRET: z.string(),
    // RAZORPAY_KEY_ID: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_EMAILJS_SERVICE_ID: z.string(),
    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID: z.string(),
    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: z.string(),
    // NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    EMAILJS_SERVICE_ID: process.env.EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID: process.env.EMAILJS_TEMPLATE_ID,
    EMAILJS_PUBLIC_KEY: process.env.EMAILJS_PUBLIC_KEY,
    EMAILJS_PRIVATE_KEY: process.env.EMAILJS_PRIVATE_KEY,
    NEXT_PUBLIC_EMAILJS_SERVICE_ID: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
    // RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    // RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    // RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
    // NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
