import { getCourtById } from "@/actions/court-actions";
import { CourtForm } from "@/components/dashboard/court-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Force dynamic rendering since this route uses authentication
export const dynamic = "force-dynamic";

interface EditCourtPageProps {
  params: Promise<{
    facilityId: string;
    courtId: string;
  }>;
}

export default async function EditCourtPage({ params }: EditCourtPageProps) {
  const { facilityId, courtId } = await params;

  // Fetch court data
  let court;
  try {
    court = await getCourtById(courtId);
  } catch (error) {
    console.error("Failed to fetch court for editing:", error);
    notFound();
  }

  if (!court || court.facilityId !== facilityId) {
    notFound();
  }

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
            <h1 className="text-3xl font-bold tracking-tight">Edit Court</h1>
            <p className="text-muted-foreground">
              Update {court.name} settings
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link
            href={`/dashboard/facilities/${facilityId}/courts/${courtId}/time-slots`}
          >
            <Clock className="mr-2 h-4 w-4" />
            Manage Time Slots
          </Link>
        </Button>
      </div>

      {/* Court Form */}
      <CourtForm facilityId={facilityId} initialData={court} isEditing={true} />
    </div>
  );
}
