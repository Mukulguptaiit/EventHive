import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { env } from "@/env";
import { emailOTP, customSession } from "better-auth/plugins";
import { Resend } from "resend";
import { createAttendeeProfile } from "./utils";
import { createAuthMiddleware } from "better-auth/api";
import type { $Enums } from "@/generated/prisma";

// Initialize Resend client
const resend = new Resend(env.RESEND_API_KEY);

// Store role data temporarily during signup process
const signupRoleData = new Map<string, $Enums.UserRole>();

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
  // Configure email provider for Better Auth
  email: {
    from: "EventHive <noreply@krishkoria.com>",
    provider: {
      async sendEmail({ to, subject, html }) {
        console.log("🔥 Better Auth Email Provider - Sending email");
        console.log("📧 To:", to);
        console.log("📋 Subject:", subject);
        
        try {
          const result = await resend.emails.send({
            from: "EventHive <noreply@krishkoria.com>",
            to: [to],
            subject,
            html,
          });
          console.log("✅ Email sent successfully via Better Auth provider!", result);
        } catch (error) {
          console.error("❌ Better Auth email provider error:", error);
          throw error;
        }
      },
    },
  },
  // Add request middleware to capture role data from signup
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Capture role data from email/password signup requests
      if (ctx.path === "/sign-up/email") {
        const role =
          ctx.headers?.get?.("x-signup-role") || ctx.headers?.["x-signup-role"];
        const body = ctx.body as any;

        if (role && body?.email) {
          // Store the role temporarily using email as key
          signupRoleData.set(body.email, role as $Enums.UserRole);
        }
      }
    }),
  },
  // Add database hooks for PlayerProfile creation
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            // Check for stored role data using email
            const selectedRole = signupRoleData.get(user.email) || "ATTENDEE";

            // Clean up the temporary role data
            signupRoleData.delete(user.email);

            const result = await createAttendeeProfile(
              user.id,
              {
                image: user.image,
                name: user.name,
              },
              selectedRole,
            );

            if (!result.success) {
              console.error(
                `Failed to create AttendeeProfile for user ${user.id}:`,
                result.error,
              );
            }
          } catch (error) {
            console.error(
              `Error creating AttendeeProfile for user ${user.id}:`,
              error,
            );
          }
        },
      },
    },
  },
  plugins: [
    customSession(async ({ user, session }) => {
      // Fetch the AttendeeProfile to include role in session
      const attendeeProfile = await prisma.attendeeProfile.findUnique({
        where: { userId: user.id },
        select: { role: true },
      });

      return {
        user: {
          ...user,
          role: attendeeProfile?.role || "ATTENDEE",
        },
        session,
      };
    }),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        console.log("🔥 OTP Email Debug - Starting email send process");
        console.log("📧 Email:", email);
        console.log("🔑 OTP:", otp);
        console.log("📋 Type:", type);
        console.log("🌐 Resend API Key exists:", !!env.RESEND_API_KEY);
        
        let subject: string;
        let html: string;

        if (type === "email-verification") {
          subject = "Verify your EventHive account";
          html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333; text-align: center;">Welcome to EventHive!</h2>
              <p style="color: #666; font-size: 16px;">Thank you for signing up. Please verify your email address with the code below:</p>
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                <h1 style="color: #333; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
              </div>
              <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes. If you didn't create an account, please ignore this email.</p>
              <p style="color: #666; font-size: 14px;">Best regards,<br>The EventHive Team</p>
            </div>
          `;
        } else if (type === "forget-password") {
          subject = "Reset your EventHive password";
          html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333; text-align: center;">Password Reset</h2>
              <p style="color: #666; font-size: 16px;">Please use the verification code below to reset your password:</p>
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                <h1 style="color: #333; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
              </div>
              <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes. If you didn't request a password reset, please ignore this email.</p>
              <p style="color: #666; font-size: 14px;">Best regards,<br>The EventHive Team</p>
            </div>
          `;
        } else {
          subject = "EventHive verification code";
          html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333; text-align: center;">Verification Code</h2>
              <p style="color: #666; font-size: 16px;">Please use the verification code below:</p>
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                <h1 style="color: #333; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
              </div>
              <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
              <p style="color: #666; font-size: 14px;">Best regards,<br>The EventHive Team</p>
            </div>
          `;
        }

        try {
          console.log("📤 Attempting to send email via Resend...");
          const result = await resend.emails.send({
            from: "EventHive <noreply@krishkoria.com>",
            to: [email],
            subject,
            html,
          });
          console.log("✅ Email sent successfully! Result:", result);
        } catch (error) {
          console.error("❌ Failed to send OTP email:", error);
          // Log the full error details for debugging
          if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
          }
          throw new Error("Failed to send verification email");
        }
      },
      otpLength: 6,
      expiresIn: 600, // 10 minutes
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
  },
});
