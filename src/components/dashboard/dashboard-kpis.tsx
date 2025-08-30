"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Users,
  TrendingUp,
  Star,
  Calendar,
  DollarSign,
  Activity,
  Clock,
} from "lucide-react";
import { getFacilityOwnerStats } from "@/actions/dashboard-actions";

interface DashboardStats {
  overview: {
    totalFacilities: number;
    activeCourts: number;
    totalBookings: number;
    totalRevenue: number;
    averageRating: number;
    totalReviews: number;
  };
  bookingStats: {
    confirmed: number;
    completed: number;
    cancelled: number;
    total: number;
  };
  sportTypeStats: Record<string, number>;
  facilities: Array<{
    id: string;
    name: string;
    status: string;
    courtsCount: number;
    rating: number | null;
    reviewCount: number;
  }>;
}

interface DashboardKPIsProps {
  facilityId?: string;
}

export function DashboardKPIs({ facilityId }: DashboardKPIsProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getFacilityOwnerStats(facilityId);
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };

    void fetchStats();
  }, [facilityId]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 rounded bg-gray-200"></div>
              <div className="h-4 w-4 rounded bg-gray-200"></div>
            </CardHeader>
            <CardContent>
              <div className="h-6 w-16 rounded bg-gray-200"></div>
              <div className="mt-2 h-3 w-24 rounded bg-gray-100"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="col-span-full">
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p className="font-medium">Error loading dashboard data</p>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="col-span-full">
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <p>No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { overview, bookingStats } = stats;

  // Calculate completion rate
  const completionRate =
    bookingStats.total > 0
      ? ((bookingStats.completed / bookingStats.total) * 100).toFixed(1)
      : "0";

  // Calculate cancellation rate
  const cancellationRate =
    bookingStats.total > 0
      ? ((bookingStats.cancelled / bookingStats.total) * 100).toFixed(1)
      : "0";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Facilities */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Facilities
          </CardTitle>
          <Building2 className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overview.totalFacilities}</div>
          <p className="text-muted-foreground text-xs">Facilities managed</p>
        </CardContent>
      </Card>

      {/* Active Courts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Courts</CardTitle>
          <Activity className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overview.activeCourts}</div>
          <p className="text-muted-foreground text-xs">
            Courts available for booking
          </p>
        </CardContent>
      </Card>

      {/* Total Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue (30d)</CardTitle>
          <DollarSign className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${overview.totalRevenue.toLocaleString()}
          </div>
          <p className="text-muted-foreground text-xs">
            From {bookingStats.completed + bookingStats.confirmed} bookings
          </p>
        </CardContent>
      </Card>

      {/* Average Rating */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          <Star className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 text-2xl font-bold">
            {overview.averageRating || "N/A"}
            {overview.averageRating > 0 && (
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            )}
          </div>
          <p className="text-muted-foreground text-xs">
            From {overview.totalReviews} reviews
          </p>
        </CardContent>
      </Card>

      {/* Total Bookings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          <Calendar className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{bookingStats.total}</div>
          <p className="text-muted-foreground text-xs">Last 30 days</p>
        </CardContent>
      </Card>

      {/* Confirmed Bookings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
          <Users className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {bookingStats.confirmed}
          </div>
          <p className="text-muted-foreground text-xs">Upcoming bookings</p>
        </CardContent>
      </Card>

      {/* Completion Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <TrendingUp className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {completionRate}%
          </div>
          <p className="text-muted-foreground text-xs">
            {bookingStats.completed} completed bookings
          </p>
        </CardContent>
      </Card>

      {/* Cancellation Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cancellations</CardTitle>
          <Clock className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {cancellationRate}%
          </div>
          <p className="text-muted-foreground text-xs">
            {bookingStats.cancelled} cancelled bookings
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
