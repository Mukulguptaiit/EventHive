"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Flag,
  User,
  Building2,
  Calendar,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Trash2,
  FileText,
  ExternalLink,
} from "lucide-react";
import {
  getAllReports,
  updateReportStatus,
  deleteReport,
  type AdminReport,
} from "@/actions/report-actions";
import { ReportStatus, ReportType } from "@/generated/prisma";
import { toast } from "sonner";

interface AdminReportsProps {
  reports: AdminReport[];
  onReportUpdated?: () => void;
}

const REPORT_TYPE_LABELS = {
  [ReportType.USER_HARASSMENT]: "User Harassment",
  [ReportType.USER_INAPPROPRIATE_BEHAVIOR]: "Inappropriate Behavior",
  [ReportType.USER_SPAM]: "Spam",
  [ReportType.FACILITY_INAPPROPRIATE_CONTENT]: "Inappropriate Content",
  [ReportType.FACILITY_FALSE_INFORMATION]: "False Information",
  [ReportType.FACILITY_SAFETY_CONCERN]: "Safety Concern",
  [ReportType.OTHER]: "Other",
};

const STATUS_COLORS = {
  [ReportStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [ReportStatus.UNDER_REVIEW]: "bg-blue-100 text-blue-800",
  [ReportStatus.RESOLVED]: "bg-green-100 text-green-800",
  [ReportStatus.DISMISSED]: "bg-gray-100 text-gray-800",
};

const STATUS_ICONS = {
  [ReportStatus.PENDING]: Clock,
  [ReportStatus.UNDER_REVIEW]: AlertTriangle,
  [ReportStatus.RESOLVED]: CheckCircle,
  [ReportStatus.DISMISSED]: XCircle,
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function AdminReports({
  reports: initialReports,
  onReportUpdated,
}: AdminReportsProps) {
  const [reports, setReports] = useState<AdminReport[]>(initialReports);
  const [filteredReports, setFilteredReports] = useState<AdminReport[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [refreshing, setRefreshing] = useState(false);
  const [reviewingReport, setReviewingReport] = useState<string | null>(null);
  const [deletingReport, setDeletingReport] = useState<string | null>(null);

  useEffect(() => {
    filterReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reports, searchTerm, statusFilter, typeFilter]);

  const refreshReports = async () => {
    try {
      setRefreshing(true);
      const result = await getAllReports();
      if (result.success) {
        setReports(result.data || []);
        toast.success("Reports refreshed successfully");
      } else {
        toast.error(result.error || "Failed to refresh reports");
      }
    } catch (error) {
      console.error("Error refreshing reports:", error);
      toast.error("Failed to refresh reports");
    } finally {
      setRefreshing(false);
    }
  };

  const filterReports = useCallback(() => {
    let filtered = [...reports];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.reporter.user.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          report.reporter.user.email
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (report.targetUser &&
            (report.targetUser.user.name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
              report.targetUser.user.email
                .toLowerCase()
                .includes(searchTerm.toLowerCase()))) ||
          report.targetFacility?.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((report) => report.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "ALL") {
      filtered = filtered.filter((report) => report.type === typeFilter);
    }

    setFilteredReports(filtered);
  }, [reports, searchTerm, statusFilter, typeFilter]);

  const handleUpdateStatus = async (
    reportId: string,
    status: ReportStatus,
    reviewNotes?: string,
    actionTaken?: string,
  ) => {
    try {
      setReviewingReport(reportId);
      const result = await updateReportStatus(
        reportId,
        status,
        reviewNotes,
        actionTaken,
      );

      if (result.success) {
        setReports((prevReports) =>
          prevReports.map((report) =>
            report.id === reportId
              ? {
                  ...report,
                  status,
                  reviewNotes: reviewNotes || report.reviewNotes,
                  actionTaken: actionTaken || report.actionTaken,
                  reviewedAt: new Date(),
                }
              : report,
          ),
        );
        toast.success("Report status updated successfully");
        onReportUpdated?.();
      } else {
        toast.error(result.error || "Failed to update report status");
      }
    } catch (error) {
      console.error("Error updating report status:", error);
      toast.error("Failed to update report status");
    } finally {
      setReviewingReport(null);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      setDeletingReport(reportId);
      const result = await deleteReport(reportId);

      if (result.success) {
        setReports((prevReports) =>
          prevReports.filter((report) => report.id !== reportId),
        );
        toast.success("Report deleted successfully");
        onReportUpdated?.();
      } else {
        toast.error(result.error || "Failed to delete report");
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
    } finally {
      setDeletingReport(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Report Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  placeholder="Search reports by user, reason, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshReports}
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value={ReportStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={ReportStatus.UNDER_REVIEW}>
                    Under Review
                  </SelectItem>
                  <SelectItem value={ReportStatus.RESOLVED}>
                    Resolved
                  </SelectItem>
                  <SelectItem value={ReportStatus.DISMISSED}>
                    Dismissed
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  {Object.entries(REPORT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Total Reports
                </p>
                <p className="text-2xl font-bold">{reports.length}</p>
              </div>
              <Flag className="text-muted-foreground h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Pending
                </p>
                <p className="text-2xl font-bold">
                  {
                    reports.filter((r) => r.status === ReportStatus.PENDING)
                      .length
                  }
                </p>
              </div>
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Under Review
                </p>
                <p className="text-2xl font-bold">
                  {
                    reports.filter(
                      (r) => r.status === ReportStatus.UNDER_REVIEW,
                    ).length
                  }
                </p>
              </div>
              <AlertTriangle className="h-4 w-4 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Resolved
                </p>
                <p className="text-2xl font-bold">
                  {
                    reports.filter((r) => r.status === ReportStatus.RESOLVED)
                      .length
                  }
                </p>
              </div>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Reports ({filteredReports.length})
          </h2>
          <Badge variant="outline">
            {searchTerm && `Search: "${searchTerm}"`}
            {statusFilter !== "ALL" && ` • ${statusFilter.toLowerCase()}`}
            {typeFilter !== "ALL" &&
              ` • ${REPORT_TYPE_LABELS[typeFilter as ReportType]}`}
          </Badge>
        </div>

        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Flag className="mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold">No Reports Found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm || statusFilter !== "ALL" || typeFilter !== "ALL"
                  ? "Try adjusting your search or filter criteria."
                  : "No reports have been submitted yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDeleteReport}
              isUpdating={reviewingReport === report.id}
              isDeleting={deletingReport === report.id}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface ReportCardProps {
  report: AdminReport;
  onUpdateStatus: (
    reportId: string,
    status: ReportStatus,
    reviewNotes?: string,
    actionTaken?: string,
  ) => void;
  onDelete: (reportId: string) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

function ReportCard({
  report,
  onUpdateStatus,
  onDelete,
  isUpdating,
  isDeleting,
}: ReportCardProps) {
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState(report.reviewNotes || "");
  const [actionTaken, setActionTaken] = useState(report.actionTaken || "");
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>(
    report.status,
  );

  const StatusIcon = STATUS_ICONS[report.status];

  const handleReview = () => {
    onUpdateStatus(report.id, selectedStatus, reviewNotes, actionTaken);
    setReviewDialogOpen(false);
  };

  const handleQuickStatusUpdate = (status: ReportStatus) => {
    onUpdateStatus(report.id, status);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <Flag className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h4 className="font-medium">
                  {REPORT_TYPE_LABELS[report.type]}
                </h4>
                <p className="text-sm text-gray-600">
                  Report #{report.id.slice(-8)}
                </p>
              </div>
              <Badge className={STATUS_COLORS[report.status]}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {report.status.replace("_", " ").toLowerCase()}
              </Badge>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div className="mb-1 flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(report.createdAt)}</span>
              </div>
              {report.reviewedAt && (
                <span className="text-xs">
                  Reviewed: {formatDate(report.reviewedAt)}
                </span>
              )}
            </div>
          </div>

          {/* Reporter Info */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>
              Reported by: {report.reporter.user.name} (
              {report.reporter.user.email})
            </span>
          </div>

          {/* Target Info */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {report.targetUser ? (
              <>
                <User className="h-4 w-4" />
                <span>
                  Target User: {report.targetUser.user.name} (
                  {report.targetUser.user.email})
                </span>
              </>
            ) : report.targetFacility ? (
              <>
                <Building2 className="h-4 w-4" />
                <span>
                  Target Facility: {report.targetFacility.name} (Owner:{" "}
                  {report.targetFacility.owner.user.name})
                </span>
              </>
            ) : null}
          </div>

          {/* Report Content */}
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium">Reason:</p>
              <p className="text-sm text-gray-700">{report.reason}</p>
            </div>
            {report.description && (
              <div>
                <p className="text-sm font-medium">Description:</p>
                <p className="text-sm text-gray-700">{report.description}</p>
              </div>
            )}
          </div>

          {/* Evidence */}
          {report.evidence.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium">Evidence:</p>
              <div className="space-y-1">
                {report.evidence.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Evidence {index + 1}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Review Notes & Action Taken */}
          {(report.reviewNotes || report.actionTaken) && (
            <div className="space-y-2 border-t pt-4">
              {report.reviewNotes && (
                <div>
                  <p className="text-sm font-medium">Review Notes:</p>
                  <p className="text-sm text-gray-700">{report.reviewNotes}</p>
                </div>
              )}
              {report.actionTaken && (
                <div>
                  <p className="text-sm font-medium">Action Taken:</p>
                  <p className="text-sm text-gray-700">{report.actionTaken}</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex gap-2">
              {report.status === ReportStatus.PENDING && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleQuickStatusUpdate(ReportStatus.UNDER_REVIEW)
                    }
                    disabled={isUpdating}
                  >
                    Mark Under Review
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleQuickStatusUpdate(ReportStatus.DISMISSED)
                    }
                    disabled={isUpdating}
                    className="text-gray-600"
                  >
                    Quick Dismiss
                  </Button>
                </>
              )}

              <Dialog
                open={reviewDialogOpen}
                onOpenChange={setReviewDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isUpdating}>
                    <FileText className="mr-2 h-4 w-4" />
                    Detailed Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Review Report</DialogTitle>
                    <DialogDescription>
                      Provide detailed review notes and specify any action
                      taken.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={selectedStatus}
                        onValueChange={(value: ReportStatus) =>
                          setSelectedStatus(value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ReportStatus.PENDING}>
                            Pending
                          </SelectItem>
                          <SelectItem value={ReportStatus.UNDER_REVIEW}>
                            Under Review
                          </SelectItem>
                          <SelectItem value={ReportStatus.RESOLVED}>
                            Resolved
                          </SelectItem>
                          <SelectItem value={ReportStatus.DISMISSED}>
                            Dismissed
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="reviewNotes">Review Notes</Label>
                      <Textarea
                        id="reviewNotes"
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Add your review notes..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="actionTaken">Action Taken</Label>
                      <Textarea
                        id="actionTaken"
                        value={actionTaken}
                        onChange={(e) => setActionTaken(e.target.value)}
                        placeholder="Describe any action taken..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setReviewDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleReview} disabled={isUpdating}>
                      Update Report
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Report</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this report? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(report.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Report
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
