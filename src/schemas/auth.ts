import { z } from "zod";

// Role enum schema matching Prisma enum
export const roleSchema = z.enum(["USER", "FACILITY_OWNER", "ADMIN"], {
  errorMap: () => ({ message: "Please select a valid role" }),
});

// Password validation with specific requirements
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(20, "Password cannot exceed 20 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[!@#$%^&*(),.?":{}|<>]/,
    "Password must contain at least one special character",
  );

// File validation for avatar upload
export const avatarFileSchema = z
  .instanceof(File)
  .refine(
    (file) => file.size <= 5 * 1024 * 1024,
    "Avatar must be less than 5MB",
  )
  .refine(
    (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    "Avatar must be a JPEG, PNG, or WebP image",
  )
  .optional();

// Email schema with proper validation
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .max(100, "Email cannot exceed 100 characters");

// Signup form schema
export const signupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(50, "Full name cannot exceed 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces"),
    avatar: avatarFileSchema,
    role: roleSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// OTP verification schema
export const otpSchema = z.object({
  email: emailSchema,
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Reset password schema
export const resetPasswordSchema = z.object({
  email: emailSchema,
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
  newPassword: passwordSchema,
});

// Type exports for TypeScript
export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type OtpFormData = z.infer<typeof otpSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type Role = z.infer<typeof roleSchema>;
