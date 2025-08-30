"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { UserRole } from "@/types/venue";

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
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      try {
        const session = await authClient.getSession();

        if (!isMounted) return;

        if (!session) {
          router.replace(redirectTo);
          return;
        }

        // Check email verification if required
        if (requireEmailVerification && !session.user.emailVerified) {
          router.replace("/auth/verify-email");
          return;
        }

        // Check role requirements
        if (requiredRoles.length > 0) {
          const userRole = session.user.role as UserRole;
          if (!userRole || !requiredRoles.includes(userRole)) {
            router.replace("/auth/login");
            return;
          }
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Session validation error:", error);
        if (isMounted) {
          router.replace(redirectTo);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    validateSession();

    return () => {
      isMounted = false;
    };
  }, [requiredRoles, requireEmailVerification, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
