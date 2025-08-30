"use client";

import { useState } from "react";
import { SignUpForm } from "@/components/forms/signup-form";
import { LoginForm } from "@/components/forms/login-form";
import { OtpVerification } from "@/components/forms/otp-verification";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { useOAuthCallback } from "@/hooks/use-oauth-callback";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";

type AuthStep =
  | "login"
  | "signup"
  | "verify-email"
  | "forgot-password"
  | "reset-password";

interface AuthPageProps {
  initialStep?: AuthStep;
}

export function AuthPage({ initialStep = "login" }: AuthPageProps) {
  const [currentStep, setCurrentStep] = useState<AuthStep>(initialStep);
  const [verificationEmail, setVerificationEmail] = useState<string>("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Handle OAuth callbacks to create player profiles
  useOAuthCallback();

  const handleSignupSuccess = (email: string) => {
    setVerificationEmail(email);
    setCurrentStep("verify-email");
    setError("");
    setSuccess(
      "Account created successfully! Please check your email for verification.",
    );
  };

  const handleLoginSuccess = () => {
    setError("");
    setSuccess("Login successful!");

    // Check for return URL in sessionStorage
    const returnUrl = sessionStorage.getItem("returnUrl");
    if (returnUrl) {
      sessionStorage.removeItem("returnUrl"); // Clean up
      window.location.href = returnUrl;
    } else {
      // Default redirect to home
      window.location.href = "/";
    }
  };

  const handleVerificationSuccess = () => {
    setError("");
    setSuccess("Email verified successfully!");
    // Check if user is now signed in automatically
    window.location.href = "/dashboard";
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setSuccess("");
  };

  const handleForgotPassword = () => {
    setCurrentStep("forgot-password");
    setError("");
    setSuccess("");
  };

  const handleForgotPasswordSuccess = (email: string) => {
    setForgotPasswordEmail(email);
    setCurrentStep("reset-password");
    setError("");
    setSuccess("Verification code sent to your email!");
  };

  const handleResetPasswordSuccess = () => {
    setError("");
    setSuccess(
      "Password reset successful! You can now log in with your new password.",
    );
    setCurrentStep("login");
    setForgotPasswordEmail("");
  };

  const handleResendOTP = async () => {
    // Implement OTP resend logic
    try {
      if (!verificationEmail) {
        handleError("No email address found");
        return;
      }

      // Call the emailOTP plugin's sendVerificationOtp method
      await authClient.emailOtp.sendVerificationOtp({
        email: verificationEmail,
        type: "email-verification",
      });

      setSuccess("Verification code sent!");
    } catch (error) {
      console.error("Resend OTP error:", error);
      handleError("Failed to resend verification code");
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "signup":
        return (
          <SignUpForm onSuccess={handleSignupSuccess} onError={handleError} />
        );
      case "verify-email":
        return (
          <OtpVerification
            email={verificationEmail}
            onSuccess={handleVerificationSuccess}
            onError={handleError}
            onResend={handleResendOTP}
          />
        );
      case "forgot-password":
        return (
          <ForgotPasswordForm
            onSuccess={handleForgotPasswordSuccess}
            onError={handleError}
            onBackToLogin={() => setCurrentStep("login")}
          />
        );
      case "reset-password":
        return (
          <ResetPasswordForm
            email={forgotPasswordEmail}
            onSuccess={handleResetPasswordSuccess}
            onError={handleError}
            onBackToForgotPassword={() => setCurrentStep("forgot-password")}
          />
        );
      default:
        return (
          <LoginForm
            onSuccess={handleLoginSuccess}
            onError={handleError}
            onForgotPassword={handleForgotPassword}
          />
        );
    }
  };

  return (
    <div className="relative container grid min-h-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Left side - Branding */}
      <div className="bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/image-auth.png"
            alt="Sports court background"
            className="h-full w-full object-cover"
            fill
          />
          <div className="absolute inset-0" />
        </div>
      </div>

      {/* Right side - Auth Forms */}
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {/* Error/Success Messages */}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {success && (
            <div className="rounded-md border border-green-200 bg-green-50 p-4">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}
          {/* Current Form */}
          {renderCurrentStep()}
          {/* Step Navigation
          {currentStep !== "verify-email" &&
            currentStep !== "forgot-password" && (
              <div className="text-center">
                <button
                  onClick={() =>
                    setCurrentStep(currentStep === "login" ? "signup" : "login")
                  }
                  className="text-muted-foreground hover:text-primary text-sm"
                >
                  {currentStep === "login"
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              </div>
            )} */}
          {/* Footer */}
          <p className="text-muted-foreground px-8 text-center text-sm">
            By clicking continue, you agree to our{" "}
            <a
              href="/terms"
              className="hover:text-primary underline underline-offset-4"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="hover:text-primary underline underline-offset-4"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
