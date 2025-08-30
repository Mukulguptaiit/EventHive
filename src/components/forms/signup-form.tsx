"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { signupSchema, type SignupFormData } from "@/schemas/auth";
import { authClient } from "@/lib/auth-client";
import { uploadFileLocally, validateImageFile } from "@/lib/file-upload";
import Link from "next/link";

interface SignUpFormProps {
  className?: string;
  onSuccess?: (email: string) => void;
  onError?: (error: string) => void;
}

export function SignUpForm({ className, onSuccess, onError }: SignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      role: "ATTENDEE",
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);

    try {
      let avatarUrl: string | undefined;
      if (data.avatar) {
        const validation = validateImageFile(data.avatar);
        if (!validation.isValid) {
          onError?.(validation.error ?? "Invalid file");
          return;
        }

        // Upload the file locally
        const uploadedFile = await uploadFileLocally(data.avatar);
        avatarUrl = uploadedFile.url;
      }

      const result = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.fullName,
        image: avatarUrl,
        fetchOptions: {
          headers: {
            "X-Signup-Role": data.role, // Pass role in custom header
          },
        },
      });

      if (result.error) {
        onError?.(result.error.message ?? "Failed to create account");
        return;
      }

      // Success - user needs to verify email
      onSuccess?.(data.email);
    } catch (error) {
      console.error("Signup error:", error);
      onError?.(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-6", className)}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your details below to create your EventHive account
          </p>
        </div>

        <div className="grid gap-4">
          {/* Avatar Upload */}
          <FormField
            control={form.control}
            name="avatar"
            render={({ field: { onChange, value: _value, ...field } }) => (
              <FormItem>
                <FormControl>
                  <AvatarUpload
                    onFileChange={onChange}
                    error={form.formState.errors.avatar?.message}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Role */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <>
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a Role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ATTENDEE">Attendee</SelectItem>
                      <SelectItem value="EVENT_ORGANIZER">
                        Event Organizer
                      </SelectItem>
                      <SelectItem value="ADMIN">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              </>
            )}
          />

          {/* Full Name */}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Create a strong password"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-muted-foreground text-xs">
                  8-20 characters with uppercase, number, and special character
                </p>
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
                    placeholder="Confirm your password"
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
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="underline underline-offset-4">
              Sign in
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
}
