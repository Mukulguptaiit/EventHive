"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { otpSchema, type OtpFormData } from "@/schemas/auth";
import { authClient } from "@/lib/auth-client";

interface OtpVerificationProps {
  email: string;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onResend?: () => Promise<void>;
}

export function OtpVerification({
  email,
  className,
  onSuccess,
  onError,
  onResend,
}: OtpVerificationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const form = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      email,
      otp: "",
    },
  });

  // Handle resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const onSubmit = async (data: OtpFormData) => {
    setIsLoading(true);

    try {
      const result = await authClient.emailOtp.verifyEmail({
        email: data.email,
        otp: data.otp,
      });
      const err = (result as any)?.error;
      if (err) {
        const msg = typeof err === "string" ? err : err.message || "Invalid verification code";
        onError?.(msg);
        return;
      }
      onSuccess?.();
    } catch (error) {
      console.error("OTP verification error:", error);
      onError?.(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    try {
      await onResend?.();
      setResendCooldown(60); // 60 second cooldown
    } catch (error) {
      onError?.(
        error instanceof Error ? error.message : "Failed to resend code",
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = form.getValues("otp").split("");
    newOtp[index] = value;

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    form.setValue("otp", newOtp.join(""));
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    form.setValue("otp", pastedData);

    // Focus the next empty input or the last input
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const otpValue = form.watch("otp");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-6", className)}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Verify your email</h1>
          <p className="text-muted-foreground text-sm text-balance">
            We&apos;ve sent a 6-digit verification code to{" "}
            <span className="font-medium">{email}</span>
          </p>
        </div>

        <div className="grid gap-4">
          {/* Hidden email field for form validation */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => <Input type="hidden" {...field} />}
          />

          {/* OTP Input */}
          <FormField
            control={form.control}
            name="otp"
            render={() => (
              <FormItem>
                <FormLabel>Verification Code</FormLabel>
                <FormControl>
                  <div className="flex justify-center gap-2">
                    {Array.from({ length: 6 }, (_, index) => (
                      <Input
                        key={index}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={otpValue[index] ?? ""}
                        onChange={(e) =>
                          handleOtpChange(
                            e.target.value.replace(/\D/g, ""),
                            index,
                          )
                        }
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className="h-12 w-12 text-center font-mono text-lg"
                        disabled={isLoading}
                      />
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Verify Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || otpValue.length !== 6}
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </Button>

          {/* Resend Section */}
          <div className="space-y-2 text-center text-sm">
            <p className="text-muted-foreground">
              Didn&apos;t receive the code?
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isResending}
              className="text-primary hover:text-primary/80"
            >
              {isResending
                ? "Sending..."
                : resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend code"}
            </Button>
          </div>
        </div>

        <div className="text-center text-sm">
          <a
            href="/signup"
            className="text-muted-foreground underline underline-offset-4"
          >
            Back to sign up
          </a>
        </div>
      </form>
    </Form>
  );
}
