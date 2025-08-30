import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export function useOAuthCallback() {
  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get current session to check if user just signed in via OAuth
        const sessionResult = await authClient.getSession();

        if (sessionResult?.data?.user) {
          const { user } = sessionResult.data;

          // Check if this user was created via OAuth by checking if they have a player profile
          const response = await fetch("/api/auth/oauth-callback", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.id,
              userData: {
                image: user.image,
              },
            }),
          });

          if (!response.ok) {
            console.error("Failed to create player profile");
          } else {
            (await response.json()) as { message: string };
          }
        }
      } catch (error) {
        console.error("OAuth callback error:", error);
      }
    };

    // Check URL for OAuth callback
    if (
      typeof window !== "undefined" &&
      window.location.pathname.includes("/api/auth/callback")
    ) {
      // Delay to ensure session is established
      setTimeout(() => {
        void handleOAuthCallback();
      }, 1000);
    }
  }, []);
}
