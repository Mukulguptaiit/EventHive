"use client";

import { authClient } from "@/lib/auth-client";
import { UserRole } from "@/types/venue";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SessionGuardProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requireEmailVerification?: boolean;
  redirectTo?: string;
}

export function SessionGuard({
  children,
  requiredRoles = [UserRole.USER],
  requireEmailVerification = false,
  redirectTo = "/auth/login",
}: SessionGuardProps) {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      try {
        // Get session from better-auth client
        const { data: session, error } = await authClient.getSession();

        if (!isMounted) return;

        if (error || !session?.user) {
          router.replace(redirectTo);
          return;
        }

        // Check email verification if required
        if (requireEmailVerification && !session.user.emailVerified) {
          router.replace("/auth/verify-email");
          return;
        }

        // Fetch user profile to get role
        try {
          const response = await fetch("/api/profile", {
            method: "GET",
            credentials: "include",
          });

          if (!response.ok) {
            throw new Error("Failed to fetch user profile");
          }

          const profile = await response.json();
          // Convert string role to UserRole enum - more explicit conversion
          const roleString = profile.role || "USER";
          let currentUserRole: UserRole;

          // Explicit role mapping to ensure proper enum conversion
          switch (roleString) {
            case "ADMIN":
              currentUserRole = UserRole.ADMIN;
              break;
            case "FACILITY_OWNER":
              currentUserRole = UserRole.FACILITY_OWNER;
              break;
            case "USER":
            default:
              currentUserRole = UserRole.USER;
              break;
          }

          if (!isMounted) return;

          setUserRole(currentUserRole);

          if (!requiredRoles.includes(currentUserRole)) {
            // Redirect based on user role
            if (
              currentUserRole === UserRole.FACILITY_OWNER ||
              currentUserRole === UserRole.ADMIN
            ) {
              router.replace("/dashboard");
            } else {
              router.replace("/");
            }
            return;
          }

          setIsAuthorized(true);
        } catch {
          const fallbackRole: UserRole = UserRole.USER;
          setUserRole(fallbackRole);

          if (requiredRoles.includes(fallbackRole)) {
            setIsAuthorized(true);
          } else {
            router.replace("/");
          }
        }
      } catch (error) {
        console.error("SessionGuard - Session validation error:", error);
        if (isMounted) {
          router.replace(redirectTo);
        }
      } finally {
        if (isMounted) {
          setIsValidating(false);
        }
      }
    };

    void validateSession();

    return () => {
      isMounted = false;
    };
  }, [router, requiredRoles, requireEmailVerification, redirectTo]);

  if (isValidating) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="text-sm text-gray-600">Validating session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Router will handle redirect
  }

  return <>{children}</>;
}
