"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, TrendingUp, DollarSign } from "lucide-react";
import {
  getBookingTrends,
  getPeakHoursData,
} from "@/actions/dashboard-actions";

interface BookingTrend {
  date: string;
  bookings: number;
  revenue: number;
  cancelled: number;
}

interface PeakHourData {
  hour: string;
  Sunday: number;
  Monday: number;
  Tuesday: number;
  Wednesday: number;
  Thursday: number;
  Friday: number;
  Saturday: number;
}

interface DashboardChartsProps {
  facilityId?: string;
}

export function DashboardCharts({ facilityId }: DashboardChartsProps) {
  const [bookingTrends, setBookingTrends] = useState<BookingTrend[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHourData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<7 | 30>(30);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [trendsData, peakData] = await Promise.all([
          getBookingTrends(facilityId, timeframe),
          getPeakHoursData(facilityId),
        ]);

        setBookingTrends(trendsData);
        setPeakHours(peakData);
      } catch (err) {
        console.error("Failed to fetch chart data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch chart data",
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [facilityId, timeframe]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 w-32 rounded bg-gray-200"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 rounded bg-gray-100"></div>
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
            <p className="font-medium">Error loading chart data</p>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Booking Trends Chart */}
      <Card className="col-span-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Booking Trends
              </CardTitle>
              <CardDescription>
                Daily booking activity and trends over the selected period
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={timeframe === 7 ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe(7)}
              >
                7 Days
              </Button>
              <Button
                variant={timeframe === 30 ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe(30)}
              >
                30 Days
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bookingTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={(value) =>
                    `Date: ${formatDate(value as string)}`
                  }
                  formatter={(value: number, name: string) => [
                    name === "revenue" ? formatCurrency(value) : value,
                    name === "bookings"
                      ? "Bookings"
                      : name === "revenue"
                        ? "Revenue"
                        : "Cancelled",
                  ]}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                  name="Bookings"
                />
                <Area
                  type="monotone"
                  dataKey="cancelled"
                  stackId="2"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.6}
                  name="Cancelled"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Trends
            </CardTitle>
            <CardDescription>
              Daily revenue from completed bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bookingTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tickFormatter={formatCurrency}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    labelFormatter={(value) =>
                      `Date: ${formatDate(value as string)}`
                    }
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "Revenue",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Peak Hours Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Peak Hours
            </CardTitle>
            <CardDescription>
              Booking activity by day and hour (last 30 days)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={peakHours}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={1} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(value: number, name: string) => [value, name]}
                    labelFormatter={(value) => `Time: ${value}`}
                  />
                  <Legend />
                  <Bar dataKey="Monday" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="Tuesday" stackId="a" fill="#06b6d4" />
                  <Bar dataKey="Wednesday" stackId="a" fill="#10b981" />
                  <Bar dataKey="Thursday" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="Friday" stackId="a" fill="#ef4444" />
                  <Bar dataKey="Saturday" stackId="a" fill="#8b5cf6" />
                  <Bar dataKey="Sunday" stackId="a" fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
