"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { authClient } from "@/lib/auth-client";

const resetPasswordSchema = z
  .object({
    otp: z.string().min(6, "Verification code must be 6 digits").max(6),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be less than 128 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don&apos;t match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  className?: string;
  email: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onBackToForgotPassword?: () => void;
  onResendCode?: () => void;
}

export function ResetPasswordForm({
  className,
  email,
  onSuccess,
  onError,
  onBackToForgotPassword,
  onResendCode,
}: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      otp: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);

    try {
      const result = await authClient.emailOtp.resetPassword({
        email,
        otp: data.otp,
        password: data.password,
      });
      const err = (result as any)?.error;
      if (err) {
        const msg = typeof err === "string" ? err : err.message || "Failed to reset password";
        onError?.(msg);
        return;
      }
      onSuccess?.();
    } catch (error) {
      console.error("Reset password error:", error);
      onError?.(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      const res = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "forget-password",
      });
      const err = (res as any)?.error;
      if (err) {
        const msg = typeof err === "string" ? err : err.message || "Failed to resend verification code";
        onError?.(msg);
        return;
      }
      onError?.(""); // Clear any existing errors
      // You might want to show a success message here
    } catch (error) {
      console.error("Resend code error:", error);
      onError?.("Failed to resend verification code");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-6", className)}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Create new password</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter the verification code sent to {email} and your new password
          </p>
        </div>

        <div className="grid gap-4">
          {/* OTP */}
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verification Code</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    {...field}
                    disabled={isLoading}
                    className="text-center text-lg tracking-wider"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* New Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset password"}
          </Button>
        </div>

        <div className="flex flex-col gap-2 text-center text-sm">
          <button
            type="button"
            onClick={onResendCode || handleResendCode}
            className="text-primary underline-offset-4 hover:underline"
            disabled={isLoading}
          >
            Didn&apos;t receive the code? Resend
          </button>
          <button
            type="button"
            onClick={onBackToForgotPassword}
            className="text-muted-foreground underline-offset-4 hover:underline"
            disabled={isLoading}
          >
            Back to email entry
          </button>
        </div>
      </form>
    </Form>
  );
}
