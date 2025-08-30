import { cleanupExpiredReservations } from "@/actions/payment-actions";

/**
 * Utility to setup periodic cleanup of expired reservations
 * This should be called when the app starts or in a background job
 */
export function setupReservationCleanup() {
  // Clean up expired reservations every 5 minutes
  const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

  const runCleanup = async () => {
    try {
      await cleanupExpiredReservations();
      console.log("Reservation cleanup completed");
    } catch (error) {
      console.error("Error during reservation cleanup:", error);
    }
  };

  // Run cleanup immediately and then periodically
  void runCleanup();
  const interval = setInterval(() => {
    void runCleanup();
  }, CLEANUP_INTERVAL);

  // Return a function to stop the cleanup
  return () => {
    clearInterval(interval);
  };
}

/**
 * Manual cleanup function that can be called on-demand
 */
export async function manualReservationCleanup() {
  try {
    console.log("Starting manual reservation cleanup...");
    await cleanupExpiredReservations();
    console.log("Manual reservation cleanup completed");
    return { success: true };
  } catch (error) {
    console.error("Error during manual reservation cleanup:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
