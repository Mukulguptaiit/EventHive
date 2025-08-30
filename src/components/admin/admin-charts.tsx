"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface AdminChartsProps {
  bookingActivity: Array<{ date: string; bookings: number }>;
  userRegistrations: Array<{ month: string; registrations: number }>;
  facilityApprovals: Array<{
    month: string;
    pending: number;
    approved: number;
    rejected: number;
  }>;
  activeSports: Array<{ sport: string; count: number }>;
}

const SPORT_COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF7C7C",
];

export function AdminCharts({
  bookingActivity,
  userRegistrations,
  facilityApprovals,
  activeSports,
}: AdminChartsProps) {
  const formatMonth = (month: string) => {
    const date = new Date(month + "-01");
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Booking Activity Chart */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Booking Activity (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={bookingActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatDate} fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip
                labelFormatter={(label) => formatDate(label as string)}
                formatter={(value) => [value, "Bookings"]}
              />
              <Area
                type="monotone"
                dataKey="bookings"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User Registration Trends */}
      <Card>
        <CardHeader>
          <CardTitle>User Registration Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userRegistrations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickFormatter={formatMonth}
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip
                labelFormatter={(label) => formatMonth(label as string)}
                formatter={(value) => [value, "New Users"]}
              />
              <Bar dataKey="registrations" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Facility Approval Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Facility Approval Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={facilityApprovals}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickFormatter={formatMonth}
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip
                labelFormatter={(label) => formatMonth(label as string)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="pending"
                stroke="#FFBB28"
                strokeWidth={2}
                name="Pending"
              />
              <Line
                type="monotone"
                dataKey="approved"
                stroke="#00C49F"
                strokeWidth={2}
                name="Approved"
              />
              <Line
                type="monotone"
                dataKey="rejected"
                stroke="#FF8042"
                strokeWidth={2}
                name="Rejected"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Most Active Sports */}
      <Card>
        <CardHeader>
          <CardTitle>Most Active Sports</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={activeSports}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ sport, percent }) =>
                  `${sport} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {activeSports.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={SPORT_COLORS[index % SPORT_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">
              Total Bookings (30d)
            </span>
            <span className="font-semibold">
              {bookingActivity.reduce((sum, day) => sum + day.bookings, 0)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">
              New Users (6m)
            </span>
            <span className="font-semibold">
              {userRegistrations.reduce(
                (sum, month) => sum + month.registrations,
                0,
              )}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">
              Facilities Approved (6m)
            </span>
            <span className="font-semibold text-green-600">
              {facilityApprovals.reduce(
                (sum, month) => sum + month.approved,
                0,
              )}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">
              Facilities Rejected (6m)
            </span>
            <span className="font-semibold text-red-600">
              {facilityApprovals.reduce(
                (sum, month) => sum + month.rejected,
                0,
              )}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">
              Most Popular Sport
            </span>
            <span className="font-semibold">
              {activeSports[0]?.sport || "N/A"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
