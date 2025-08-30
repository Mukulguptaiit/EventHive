"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  Download,
  RefreshCw,
  User,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { getFacilityBookings } from "@/actions/booking-actions";

interface Booking {
  id: string;
  startTime: Date;
  endTime: Date;
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
  totalPrice: number;
  court: {
    id: string;
    name: string;
    sportType: string;
    facility: {
      name: string;
      address: string;
    };
  };
  player: {
    user: {
      name: string;
      email: string;
    };
    phoneNumber?: string;
  };
  createdAt: Date;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [facilityFilter, setFacilityFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("upcoming");

  const facilities = Array.from(
    new Set(bookings.map((booking) => booking.court.facility.name)),
  );

  useEffect(() => {
    void fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, searchQuery, statusFilter, facilityFilter, activeTab]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const bookingsData = await getFacilityBookings();
      setBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    // Filter by upcoming/past
    const now = new Date();
    if (activeTab === "upcoming") {
      filtered = filtered.filter(
        (booking) => new Date(booking.startTime) >= now,
      );
    } else {
      filtered = filtered.filter(
        (booking) => new Date(booking.startTime) < now,
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (booking) =>
          booking.player.user.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          booking.court.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          booking.court.facility.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (booking) => booking.status.toLowerCase() === statusFilter,
      );
    }

    // Filter by facility
    if (facilityFilter !== "all") {
      filtered = filtered.filter(
        (booking) => booking.court.facility.name === facilityFilter,
      );
    }

    // Sort by date
    filtered.sort((a, b) => {
      if (activeTab === "upcoming") {
        return (
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
      } else {
        return (
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
      }
    });

    setFilteredBookings(filtered);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "Booked";
      case "CANCELLED":
        return "Cancelled";
      case "COMPLETED":
        return "Completed";
      default:
        return status;
    }
  };

  const exportBookings = () => {
    // Simple CSV export
    const headers = [
      "Date",
      "Time",
      "Customer",
      "Court",
      "Facility",
      "Status",
      "Amount",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredBookings.map((booking) =>
        [
          format(new Date(booking.startTime), "yyyy-MM-dd"),
          `${format(new Date(booking.startTime), "HH:mm")}-${format(new Date(booking.endTime), "HH:mm")}`,
          `"${booking.player.user.name}"`,
          `"${booking.court.name}"`,
          `"${booking.court.facility.name}"`,
          getStatusLabel(booking.status),
          `₹${booking.totalPrice}`,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bookings-${activeTab}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">
            View and manage customer bookings across all your facilities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchBookings()}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportBookings}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by customer name, court, or facility..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Booked</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={facilityFilter} onValueChange={setFacilityFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Facility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Facilities</SelectItem>
                {facilities.map((facility) => (
                  <SelectItem key={facility} value={facility}>
                    {facility}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">
            Upcoming Bookings (
            {
              filteredBookings.filter(
                (b) => new Date(b.startTime) >= new Date(),
              ).length
            }
            )
          </TabsTrigger>
          <TabsTrigger value="past">
            Past Bookings (
            {
              filteredBookings.filter((b) => new Date(b.startTime) < new Date())
                .length
            }
            )
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <BookingsTable bookings={filteredBookings} loading={loading} />
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <BookingsTable bookings={filteredBookings} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BookingsTable({
  bookings,
  loading,
}: {
  bookings: Booking[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading bookings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold">No bookings found</h3>
          <p className="text-gray-600">
            No bookings match your current filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Court & Facility</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Booked On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium">{booking.player.user.name}</p>
                      <p className="text-sm text-gray-600">
                        {booking.player.user.email}
                      </p>
                      {booking.player.phoneNumber && (
                        <p className="text-sm text-gray-600">
                          {booking.player.phoneNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium">
                        {format(new Date(booking.startTime), "MMM dd, yyyy")}
                      </p>
                      <p className="text-sm text-gray-600">
                        <Clock className="mr-1 inline h-3 w-3" />
                        {format(new Date(booking.startTime), "HH:mm")} -{" "}
                        {format(new Date(booking.endTime), "HH:mm")}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium">{booking.court.name}</p>
                      <p className="text-sm text-gray-600">
                        <MapPin className="mr-1 inline h-3 w-3" />
                        {booking.court.facility.name}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {booking.court.sportType}
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(booking.status)}>
                    {getStatusLabel(booking.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <p className="font-medium">₹{booking.totalPrice}</p>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-gray-600">
                    {format(new Date(booking.createdAt), "MMM dd, yyyy")}
                  </p>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-100 text-green-800 border-green-200";
    case "CANCELLED":
      return "bg-red-100 text-red-800 border-red-200";
    case "COMPLETED":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "Booked";
    case "CANCELLED":
      return "Cancelled";
    case "COMPLETED":
      return "Completed";
    default:
      return status;
  }
}
