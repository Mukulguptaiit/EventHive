import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Building2,
  Calendar,
  Activity,
  AlertTriangle,
} from "lucide-react";

interface AdminKPIsProps {
  stats: {
    totalUsers: number;
    totalFacilityOwners: number;
    totalBookings: number;
    totalActiveCourts: number;
    pendingFacilities: number;
    trends: {
      usersTrend: string;
      facilityOwnersTrend: string;
      bookingsTrend: string;
      courtsTrend: string;
      pendingTrend: string;
    };
  };
}

export function AdminKPIs({ stats }: AdminKPIsProps) {
  const kpis = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      description: "Registered users",
      trend: `${stats.trends.usersTrend} from last month`,
      isPositive: stats.trends.usersTrend.startsWith("+"),
      isNegative: stats.trends.usersTrend.startsWith("-"),
    },
    {
      title: "Facility Owners",
      value: stats.totalFacilityOwners.toLocaleString(),
      icon: Building2,
      description: "Active facility owners",
      trend: `${stats.trends.facilityOwnersTrend} from last month`,
      isPositive: stats.trends.facilityOwnersTrend.startsWith("+"),
      isNegative: stats.trends.facilityOwnersTrend.startsWith("-"),
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings.toLocaleString(),
      icon: Calendar,
      description: "All-time bookings",
      trend: `${stats.trends.bookingsTrend} from last month`,
      isPositive: stats.trends.bookingsTrend.startsWith("+"),
      isNegative: stats.trends.bookingsTrend.startsWith("-"),
    },
    {
      title: "Active Courts",
      value: stats.totalActiveCourts.toLocaleString(),
      icon: Activity,
      description: "Available courts",
      trend: `${stats.trends.courtsTrend} from last month`,
      isPositive: stats.trends.courtsTrend.startsWith("+"),
      isNegative: stats.trends.courtsTrend.startsWith("-"),
    },
    {
      title: "Pending Approvals",
      value: stats.pendingFacilities.toLocaleString(),
      icon: AlertTriangle,
      description: "Facilities awaiting approval",
      trend: stats.trends.pendingTrend,
      urgent: stats.pendingFacilities > 0,
      isPositive: false,
      isNegative: false,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className={kpi.urgent ? "border-orange-200" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            <kpi.icon
              className={`h-4 w-4 ${kpi.urgent ? "text-orange-600" : "text-muted-foreground"}`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${kpi.urgent ? "text-orange-600" : ""}`}
            >
              {kpi.value}
            </div>
            <p className="text-muted-foreground text-xs">{kpi.description}</p>
            <p
              className={`mt-1 text-xs ${
                kpi.urgent
                  ? "text-orange-600"
                  : kpi.isPositive
                    ? "text-green-600"
                    : kpi.isNegative
                      ? "text-red-600"
                      : "text-muted-foreground"
              }`}
            >
              {kpi.trend}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
