"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UserRole } from "@/types/venue";
import { ReportType, ReportStatus } from "@/generated/prisma";

export interface CreateReportData {
  type: ReportType;
  reason: string;
  description?: string;
  evidence?: string[];
  targetUserId?: string;
  targetFacilityId?: string;
}

export interface AdminReport {
  id: string;
  type: ReportType;
  status: ReportStatus;
  reason: string;
  description: string | null;
  evidence: string[];
  createdAt: Date;
  updatedAt: Date;
  reviewedAt: Date | null;
  reviewNotes: string | null;
  actionTaken: string | null;
  reporter: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
  targetUser?: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  } | null;
  targetFacility?: {
    id: string;
    name: string;
    owner: {
      user: {
        name: string;
        email: string;
      };
    };
  } | null;
}

/**
 * Submit a new report
 */
export async function submitReport(data: CreateReportData): Promise<{
  success: boolean;
  reportId?: string;
  error?: string;
}> {
  try {
    // Get current user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    // Get player profile
    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!playerProfile) {
      return { success: false, error: "Player profile not found" };
    }

    // Validate that either targetUserId or targetFacilityId is provided, but not both
    if (
      (!data.targetUserId && !data.targetFacilityId) ||
      (data.targetUserId && data.targetFacilityId)
    ) {
      return {
        success: false,
        error: "Must specify either a user or facility to report, but not both",
      };
    }

    // Validate target exists
    if (data.targetUserId) {
      const targetUser = await prisma.playerProfile.findUnique({
        where: { id: data.targetUserId },
        select: { id: true },
      });
      if (!targetUser) {
        return { success: false, error: "Target user not found" };
      }
    }

    if (data.targetFacilityId) {
      const targetFacility = await prisma.facility.findUnique({
        where: { id: data.targetFacilityId },
        select: { id: true },
      });
      if (!targetFacility) {
        return { success: false, error: "Target facility not found" };
      }
    }

    // Create the report
    const report = await prisma.report.create({
      data: {
        type: data.type,
        reason: data.reason,
        description: data.description || null,
        evidence: data.evidence || [],
        reporterId: playerProfile.id,
        targetUserId: data.targetUserId || null,
        targetFacilityId: data.targetFacilityId || null,
      },
    });

    return { success: true, reportId: report.id };
  } catch (error) {
    console.error("Error submitting report:", error);
    return { success: false, error: "Failed to submit report" };
  }
}

/**
 * Get all reports for admin panel
 */
export async function getAllReports(): Promise<{
  success: boolean;
  data?: AdminReport[];
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user has admin role
    const userProfile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { role: true },
    });

    if (!userProfile || userProfile.role !== UserRole.ADMIN) {
      return { success: false, error: "Admin access required" };
    }

    const reports = await prisma.report.findMany({
      include: {
        reporter: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        targetUser: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        targetFacility: {
          include: {
            owner: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: reports };
  } catch (error) {
    console.error("Error fetching reports:", error);
    return { success: false, error: "Failed to fetch reports" };
  }
}

/**
 * Update report status and add admin review notes
 */
export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  reviewNotes?: string,
  actionTaken?: string,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    // Check if user has admin role
    const userProfile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { role: true, id: true },
    });

    if (!userProfile || userProfile.role !== UserRole.ADMIN) {
      return { success: false, error: "Admin access required" };
    }

    // Check if report exists
    const existingReport = await prisma.report.findUnique({
      where: { id: reportId },
      select: { id: true },
    });

    if (!existingReport) {
      return { success: false, error: "Report not found" };
    }

    // Update the report
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status,
        reviewNotes: reviewNotes || null,
        actionTaken: actionTaken || null,
        reviewedById: userProfile.id,
        reviewedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating report status:", error);
    return { success: false, error: "Failed to update report status" };
  }
}

/**
 * Delete a report (admin only)
 */
export async function deleteReport(reportId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    // Check if user has admin role
    const userProfile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { role: true },
    });

    if (!userProfile || userProfile.role !== UserRole.ADMIN) {
      return { success: false, error: "Admin access required" };
    }

    // Check if report exists
    const existingReport = await prisma.report.findUnique({
      where: { id: reportId },
      select: { id: true },
    });

    if (!existingReport) {
      return { success: false, error: "Report not found" };
    }

    // Delete the report
    await prisma.report.delete({
      where: { id: reportId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting report:", error);
    return { success: false, error: "Failed to delete report" };
  }
}

/**
 * Get report statistics for admin dashboard
 */
export async function getReportStats(): Promise<{
  success: boolean;
  data?: {
    totalReports: number;
    pendingReports: number;
    resolvedReports: number;
    dismissedReports: number;
    underReviewReports: number;
    reportsByType: Record<ReportType, number>;
  };
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user has admin role
    const userProfile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { role: true },
    });

    if (!userProfile || userProfile.role !== UserRole.ADMIN) {
      return { success: false, error: "Admin access required" };
    }

    // Get total counts
    const totalReports = await prisma.report.count();
    const pendingReports = await prisma.report.count({
      where: { status: ReportStatus.PENDING },
    });
    const resolvedReports = await prisma.report.count({
      where: { status: ReportStatus.RESOLVED },
    });
    const dismissedReports = await prisma.report.count({
      where: { status: ReportStatus.DISMISSED },
    });
    const underReviewReports = await prisma.report.count({
      where: { status: ReportStatus.UNDER_REVIEW },
    });

    // Get reports by type
    const reportsByType = await prisma.report.groupBy({
      by: ["type"],
      _count: {
        type: true,
      },
    });

    const reportTypeStats = Object.values(ReportType).reduce(
      (acc, type) => {
        acc[type] =
          reportsByType.find((r) => r.type === type)?._count.type || 0;
        return acc;
      },
      {} as Record<ReportType, number>,
    );

    return {
      success: true,
      data: {
        totalReports,
        pendingReports,
        resolvedReports,
        dismissedReports,
        underReviewReports,
        reportsByType: reportTypeStats,
      },
    };
  } catch (error) {
    console.error("Error fetching report stats:", error);
    return { success: false, error: "Failed to fetch report statistics" };
  }
}
