import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { env } from "@/env";
import { emailOTP, customSession } from "better-auth/plugins";
import emailjs from '@emailjs/nodejs';
import { createPlayerProfile } from "./utils";
import { createAuthMiddleware } from "better-auth/api";
import type { UserRole } from "@/types/venue";

// EmailJS config is in env

// Store role data temporarily during signup process
const signupRoleData = new Map<string, UserRole>();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  credentials: {
    enabled: true,
  },
  emailVerification: {
    autoSignInAfterVerification: true,
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
          signupRoleData.set(body.email, role as UserRole);
        }
      }
    }),
  },
  // Add database hooks for UserProfile creation
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            // Check for stored role data using email
            const selectedRole = signupRoleData.get(user.email) || "USER";

            // Clean up the temporary role data
            signupRoleData.delete(user.email);

            const result = await createPlayerProfile(
              user.id,
              {
                image: user.image,
                name: user.name,
              },
              selectedRole,
            );

            if (!result.success) {
              console.error(
        `Failed to create UserProfile for user ${user.id}:`,
                result.error,
              );
            }
          } catch (error) {
            console.error(
        `Error creating UserProfile for user ${user.id}:`,
              error,
            );
          }
        },
      },
    },
  },
  plugins: [
    customSession(async ({ user, session }) => {
      return {
        user: {
          ...user,
      // Default role for now; extend when role storage is added to profile
      role: "USER",
        },
        session,
      };
    }),
    emailOTP({
      overrideDefaultEmailVerification: true,
  async sendVerificationOTP({ email, otp, type: _type }) {
        // Email body/subject handled by EmailJS template; we just pass variables

        try {
          // EmailJS expects variables: email, passcode, time
          // Calculate expiry time (15 min from now)
          const expiry = new Date(Date.now() + 15 * 60 * 1000);
          const time = expiry.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          await emailjs.send(
            env.EMAILJS_SERVICE_ID,
            env.EMAILJS_TEMPLATE_ID,
            {
              email,
              passcode: otp,
              time,
            },
            {
              publicKey: env.EMAILJS_PUBLIC_KEY,
              privateKey: env.EMAILJS_PRIVATE_KEY,
            }
          );
        } catch (error) {
          console.error("Failed to send OTP email via EmailJS:", error);
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
