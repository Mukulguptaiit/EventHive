import { getPendingFacilities } from "@/actions/admin-actions";
import { FacilityApprovalCard } from "@/components/admin/facility-approval-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: { status?: string };
}

export default async function FacilityApprovalPage({
  searchParams,
}: PageProps) {
  const pendingFacilities = await getPendingFacilities();
  const status = searchParams.status || "pending";

  // For demo purposes, we'll show pending facilities
  // In a real app, you'd filter based on the status parameter
  const facilities = pendingFacilities;

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
              <Building2 className="h-8 w-8 text-blue-600" />
              Facility Approvals
            </h1>
            <p className="text-muted-foreground">
              Review and approve facility registrations
            </p>
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 border-b">
        <Link href="/admin/facilities?status=pending">
          <Button
            variant={status === "pending" ? "default" : "ghost"}
            size="sm"
            className="gap-2"
          >
            <Clock className="h-4 w-4" />
            Pending
            <Badge variant="secondary">{facilities.length}</Badge>
          </Button>
        </Link>
        <Link href="/admin/facilities?status=approved">
          <Button
            variant={status === "approved" ? "default" : "ghost"}
            size="sm"
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Approved
          </Button>
        </Link>
        <Link href="/admin/facilities?status=rejected">
          <Button
            variant={status === "rejected" ? "default" : "ghost"}
            size="sm"
            className="gap-2"
          >
            <XCircle className="h-4 w-4" />
            Rejected
          </Button>
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {facilities.length}
            </div>
            <p className="text-muted-foreground text-xs">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courts</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {facilities.reduce((sum, f) => sum + f.courts.length, 0)}
            </div>
            <p className="text-muted-foreground text-xs">
              Across all pending facilities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Review Time
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">2.3</div>
            <p className="text-muted-foreground text-xs">
              Days (target: &lt; 3 days)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">87%</div>
            <p className="text-muted-foreground text-xs">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Facilities List */}
      {facilities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="mb-4 h-12 w-12 text-green-600" />
            <h3 className="mb-2 text-lg font-semibold">All Caught Up!</h3>
            <p className="text-muted-foreground text-center">
              No facilities are currently pending approval. Great work!
            </p>
            <Button asChild className="mt-4">
              <Link href="/admin">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Alert for high volume */}
          {facilities.length > 5 && (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="h-5 w-5" />
                  High Volume Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-700">
                  You have {facilities.length} facilities pending approval.
                  Consider prioritizing older submissions to maintain good
                  service levels.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Pending Facilities ({facilities.length})
              </h2>
              <p className="text-muted-foreground text-sm">
                Sorted by submission date (oldest first)
              </p>
            </div>

            <div className="grid gap-4">
              {facilities.map((facility) => (
                <FacilityApprovalCard key={facility.id} facility={facility} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
