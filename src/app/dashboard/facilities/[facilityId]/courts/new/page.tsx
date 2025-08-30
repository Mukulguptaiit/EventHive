import { getFacilityById } from "@/actions/facility-actions";
import { CourtForm } from "@/components/dashboard/court-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Force dynamic rendering since this route uses authentication
export const dynamic = "force-dynamic";

interface NewCourtPageProps {
  params: Promise<{
    facilityId: string;
  }>;
}

export default async function NewCourtPage({ params }: NewCourtPageProps) {
  const { facilityId } = await params;

  // Verify facility exists and user has access
  let facility;
  try {
    facility = await getFacilityById(facilityId);
  } catch (error) {
    console.error("Failed to fetch facility for new court:", error);
    notFound();
  }

  if (!facility) {
    notFound();
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/facilities/${facilityId}/courts`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courts
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Court</h1>
          <p className="text-muted-foreground">
            Create a new court for {facility.name}
          </p>
        </div>
      </div>

      {/* Court Form */}
      <CourtForm facilityId={facilityId} />
    </div>
  );
}
