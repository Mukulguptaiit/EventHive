import { prisma } from "./prisma";

/**
 * Check if a user owns a facility through their PlayerProfile
 */
export async function checkUserFacilityOwnership(
  userId: string,
  facilityId: string,
): Promise<boolean> {
  try {
    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!playerProfile) {
      return false;
    }

    const facility = await prisma.facility.findUnique({
      where: {
        id: facilityId,
        ownerId: playerProfile.id,
      },
    });

    return !!facility;
  } catch (error) {
    console.error("Error checking facility ownership:", error);
    return false;
  }
}

/**
 * Check if a user can access a court (either owns the facility or is admin)
 */
export async function checkCourtAccess(
  userId: string,
  userRole: string,
  courtId: string,
): Promise<boolean> {
  try {
    // Admins have access to everything
    if (userRole === "ADMIN") {
      return true;
    }

    // Get the court's facility
    const court = await prisma.court.findUnique({
      where: { id: courtId },
      select: { facilityId: true },
    });

    if (!court) {
      return false;
    }

    // Check if user owns the facility
    return await checkUserFacilityOwnership(userId, court.facilityId);
  } catch (error) {
    console.error("Error checking court access:", error);
    return false;
  }
}
