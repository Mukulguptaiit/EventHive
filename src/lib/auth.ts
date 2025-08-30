import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { emailOTP } from "better-auth/plugins/email-otp";
import { send as sendEmail } from "@emailjs/nodejs";
import { env } from "@/env";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    autoSignInAfterVerification: true,
  },
  session: {
    expiresIn: 60 * 60 * 24, // 24 hours
  },
  plugins: [
    emailOTP({
      // send OTP emails for both verification and password reset
      async sendVerificationOTP({ email, otp, type }) {
        // Prefer server-side keys to avoid exposing private key
        await sendEmail(
          env.EMAILJS_SERVICE_ID,
          env.EMAILJS_TEMPLATE_ID,
          {
            email,
            passcode: otp,
            time: new Date().toISOString(),
            type,
          },
          {
            publicKey: env.EMAILJS_PUBLIC_KEY,
            privateKey: env.EMAILJS_PRIVATE_KEY,
          },
        );
      },
      otpLength: 6,
      expiresIn: 60 * 10, // 10 minutes
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Allow all sign-ins for now
      return true;
    },
    async session({ session, user }) {
      // Add user ID to session
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    signUp: "/auth/signup",
    verifyEmail: "/auth/verify-email",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },
});
