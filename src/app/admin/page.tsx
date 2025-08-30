import { AdminKPIs } from "@/components/admin/admin-kpis";
import { AdminCharts } from "@/components/admin/admin-charts";
import {
  getGlobalStats,
  getBookingActivityData,
  getUserRegistrationTrends,
  getFacilityApprovalTrends,
  getMostActiveSports,
} from "@/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  Users,
  Building2,
  AlertTriangle,
  Star,
  Flag,
} from "lucide-react";
import Link from "next/link";

export default async function AdminPage() {
  const [
    stats,
    bookingActivity,
    userRegistrations,
    facilityApprovals,
    activeSports,
  ] = await Promise.all([
    getGlobalStats(),
    getBookingActivityData(),
    getUserRegistrationTrends(),
    getFacilityApprovalTrends(),
    getMostActiveSports(),
  ]);

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Shield className="h-8 w-8 text-blue-600" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            System-wide overview and management tools
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/reports">
              <Flag className="mr-2 h-4 w-4" />
              Reports
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/reviews">
              <Star className="mr-2 h-4 w-4" />
              Review Management
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/users">
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/facilities">
              <Building2 className="mr-2 h-4 w-4" />
              Facility Approvals
              {stats.pendingFacilities > 0 && (
                <span className="ml-1 rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">
                  {stats.pendingFacilities}
                </span>
              )}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/profile">
              <Shield className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </Button>
        </div>
      </div>

      {/* System Alerts - Action Required */}
      {stats.pendingFacilities > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-orange-700">
              {stats.pendingFacilities} facilities are awaiting approval. Review
              them to keep the platform running smoothly.
            </p>
            <Button
              asChild
              size="sm"
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Link href="/admin/facilities">Review Pending Facilities</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <AdminKPIs stats={stats} />

      {/* Charts Section */}
      <AdminCharts
        bookingActivity={bookingActivity}
        userRegistrations={userRegistrations}
        facilityApprovals={facilityApprovals}
        activeSports={activeSports}
      />

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Report Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground text-sm">
              Monitor and manage user reports
            </p>
            <div className="space-y-2">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/admin/reports">All Reports</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/admin/reports?status=PENDING">
                  Pending Reports
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Review Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground text-sm">
              Monitor and moderate venue reviews
            </p>
            <div className="space-y-2">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/admin/reviews">All Reviews</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/admin/reviews?filter=low-rating">Low Ratings</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground text-sm">
              Manage user accounts, roles, and permissions
            </p>
            <div className="space-y-2">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/admin/users">View All Users</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/admin/users?filter=banned">View Banned Users</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Facility Oversight
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground text-sm">
              Review and approve facility registrations
            </p>
            <div className="space-y-2">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/admin/facilities">
                  Pending Approvals
                  {stats.pendingFacilities > 0 && (
                    <span className="ml-2 rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">
                      {stats.pendingFacilities}
                    </span>
                  )}
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/admin/facilities?status=approved">
                  Approved Facilities
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
