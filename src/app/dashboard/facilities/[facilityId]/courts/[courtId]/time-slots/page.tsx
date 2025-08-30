import { getCourtTimeSlots } from "@/actions/time-slot-actions";
import { getFacilityById } from "@/actions/facility-actions";
import { getCourtById } from "@/actions/court-actions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Calendar, Clock, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Force dynamic rendering since this route uses authentication
export const dynamic = "force-dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/dashboard/date-picker";

interface TimeSlotsPageProps {
  params: Promise<{
    facilityId: string;
    courtId: string;
  }>;
  searchParams: Promise<{
    date?: string;
  }>;
}

export default async function TimeSlotsPage({
  params,
  searchParams,
}: TimeSlotsPageProps) {
  const { facilityId, courtId } = await params;
  const { date } = await searchParams;

  // Get facility, court, and time slots data
  let facility, court, timeSlots;
  try {
    const selectedDate = date ? new Date(date) : new Date();

    [facility, court, timeSlots] = await Promise.all([
      getFacilityById(facilityId),
      getCourtById(courtId),
      getCourtTimeSlots(courtId, { date: selectedDate }),
    ]);
  } catch (error) {
    console.error("Failed to fetch time slots data:", error);
    notFound();
  }

  if (!facility || !court || court.facilityId !== facilityId) {
    notFound();
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getSlotStatus = (slot: any) => {
    if (slot.isMaintenanceBlocked) return "maintenance";
    if (slot.booking) return "booked";
    return "available";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <Badge variant="outline" className="border-green-600 text-green-600">
            Available
          </Badge>
        );
      case "booked":
        return <Badge variant="destructive">Booked</Badge>;
      case "maintenance":
        return <Badge variant="secondary">Maintenance</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const selectedDate = date ? new Date(date) : new Date();
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/facilities/${facilityId}/courts`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courts
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Time Slots - {court.name}
            </h1>
            <p className="text-muted-foreground">
              Manage time slots for {court.name} at {facility.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link
              href={`/dashboard/facilities/${facilityId}/courts/${courtId}/time-slots/generate`}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Generate Slots
            </Link>
          </Button>
          <Button asChild>
            <Link
              href={`/dashboard/facilities/${facilityId}/courts/${courtId}/time-slots/new`}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Time Slot
            </Link>
          </Button>
        </div>
      </div>

      {/* Date Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Date Selection
          </CardTitle>
          <CardDescription>
            Select a date to view and manage time slots
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button variant={!date ? "default" : "outline"} size="sm" asChild>
              <Link
                href={`/dashboard/facilities/${facilityId}/courts/${courtId}/time-slots`}
              >
                Today
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/dashboard/facilities/${facilityId}/courts/${courtId}/time-slots?date=${tomorrow.toISOString().split("T")[0]}`}
              >
                Tomorrow
              </Link>
            </Button>
            <DatePicker
              facilityId={facilityId}
              courtId={courtId}
              selectedDate={selectedDate}
            />
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
            Viewing slots for: {formatDate(selectedDate)}
          </p>
        </CardContent>
      </Card>

      {/* Time Slots List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Slots ({timeSlots.length})
          </CardTitle>
          <CardDescription>
            All time slots for {court.name} on {formatDate(selectedDate)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {timeSlots.length === 0 ? (
            <div className="py-8 text-center">
              <Clock className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                No time slots found
              </h3>
              <p className="mb-4 text-gray-500">
                No time slots have been created for this date.
              </p>
              <div className="flex justify-center gap-2">
                <Button asChild>
                  <Link
                    href={`/dashboard/facilities/${facilityId}/courts/${courtId}/time-slots/new`}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Time Slot
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link
                    href={`/dashboard/facilities/${facilityId}/courts/${courtId}/time-slots/generate`}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Generate Slots
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {timeSlots.map((slot) => {
                const status = getSlotStatus(slot);
                return (
                  <Card key={slot.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {formatTime(new Date(slot.startTime))} -{" "}
                            {formatTime(new Date(slot.endTime))}
                          </CardTitle>
                          <CardDescription>
                            {Math.round(
                              (new Date(slot.endTime).getTime() -
                                new Date(slot.startTime).getTime()) /
                                (1000 * 60),
                            )}{" "}
                            minutes
                          </CardDescription>
                        </div>
                        {getStatusBadge(status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">
                          Price
                        </span>
                        <span className="font-medium">
                          ₹{slot.price ?? slot.court.pricePerHour}/hour
                        </span>
                      </div>

                      {slot.booking && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">
                            Booked by
                          </span>
                          <span className="text-sm">
                            {slot.booking.player.user.name}
                          </span>
                        </div>
                      )}

                      {slot.isMaintenanceBlocked && slot.maintenanceReason && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">
                            Reason
                          </span>
                          <span className="text-sm">
                            {slot.maintenanceReason}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">
                          Waitlist
                        </span>
                        <span className="flex items-center gap-1 text-sm">
                          <Users className="h-3 w-3" />
                          {slot._count.waitlistEntries}
                        </span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          asChild
                        >
                          <Link
                            href={`/dashboard/facilities/${facilityId}/courts/${courtId}/time-slots/${slot.id}/edit`}
                          >
                            Edit
                          </Link>
                        </Button>
                        {status === "available" && (
                          <Button
                            variant={
                              slot.isMaintenanceBlocked ? "default" : "outline"
                            }
                            size="sm"
                            className="flex-1"
                          >
                            {slot.isMaintenanceBlocked ? "Unblock" : "Block"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
