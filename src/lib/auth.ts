import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

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
  async sendVerificationOTP({ email, otp, type: _type }) {
    // For now, just log the OTP
    // In production, you would send this via email/SMS
    console.log(`Verification OTP for ${email}: ${otp}`);
    
    // You can integrate with your email service here
    // Example with Resend:
    // await resend.emails.send({
    //   from: "noreply@yourdomain.com",
    //   to: email,
    //   subject: "Verify your email",
    //   html: `<p>Your verification code is: <strong>${otp}</strong></p>`,
    // });
  },
  async sendPasswordResetOTP({ email, otp, type: _type }) {
    // For now, just log the OTP
    // In production, you would send this via email/SMS
    console.log(`Password reset OTP for ${email}: ${otp}`);
    
    // You can integrate with your email service here
    // Example with Resend:
    // await resend.emails.send({
    //   from: "noreply@yourdomain.com",
    //   to: email,
    //   subject: "Reset your password",
    //   html: `<p>Your password reset code is: <strong>${otp}</strong></p>`,
    // });
  },
});
