import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, MoreHorizontal, Edit, Clock } from "lucide-react";
import Link from "next/link";
import { getFacilityCourts } from "@/actions/court-actions";
import { getFacilityById } from "@/actions/facility-actions";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteCourtDialog } from "@/components/dashboard/delete-court-dialog";

interface CourtsPageProps {
  params: Promise<{
    facilityId: string;
  }>;
}

export default async function CourtsPage({ params }: CourtsPageProps) {
  const { facilityId } = await params;

  // Fetch facility and courts data
  let facility, courts;
  try {
    [facility, courts] = await Promise.all([
      getFacilityById(facilityId),
      getFacilityCourts(facilityId),
    ]);
  } catch (error) {
    console.error("Failed to fetch facility or courts:", error);
    notFound();
  }

  if (!facility) {
    notFound();
  }

  const formatHour = (hour: number) => `${hour.toString().padStart(2, "0")}:00`;

  const getSportTypeLabel = (sportType: string) => {
    const sportLabels: Record<string, string> = {
      BADMINTON: "Badminton",
      TENNIS: "Tennis",
      SQUASH: "Squash",
      BASKETBALL: "Basketball",
      FOOTBALL: "Football",
      CRICKET: "Cricket",
      TABLE_TENNIS: "Table Tennis",
      VOLLEYBALL: "Volleyball",
    };
    return sportLabels[sportType] || sportType;
  };

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/facilities/${facilityId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Facility
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Court Management
            </h1>
            <p className="text-muted-foreground">
              Manage courts for {facility.name}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/facilities/${facilityId}/courts/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Court
          </Link>
        </Button>
      </div>

      {/* Courts List */}
      {courts.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Courts Yet</CardTitle>
            <CardDescription>
              Get started by creating your first court
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/dashboard/facilities/${facilityId}/courts/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Court
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courts.map((court) => (
            <Card key={court.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="line-clamp-1">{court.name}</CardTitle>
                    <CardDescription>
                      {getSportTypeLabel(court.sportType)}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/dashboard/facilities/${facilityId}/courts/${court.id}/time-slots`}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          Manage Time Slots
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/dashboard/facilities/${facilityId}/courts/${court.id}/edit`}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Court
                        </Link>
                      </DropdownMenuItem>
                      <DeleteCourtDialog
                        courtId={court.id}
                        courtName={court.name}
                        facilityId={facilityId}
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Status</span>
                  <Badge variant={court.isActive ? "default" : "secondary"}>
                    {court.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Default Price/Hour
                  </span>
                  <span className="font-medium">₹{court.pricePerHour}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Operating Hours
                  </span>
                  <span className="text-sm">
                    {formatHour(court.operatingStartHour)} -{" "}
                    {formatHour(court.operatingEndHour)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
                  <div className="text-center">
                    <div className="font-medium">{court._count.bookings}</div>
                    <div className="text-muted-foreground">Bookings</div>
                  </div>
                  <Link
                    href={`/dashboard/facilities/${facilityId}/courts/${court.id}/time-slots`}
                    className="hover:bg-muted rounded-md p-2 text-center transition-colors"
                  >
                    <div className="font-medium text-blue-600">
                      {court._count.timeSlots}
                    </div>
                    <div className="text-muted-foreground">Time Slots</div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
