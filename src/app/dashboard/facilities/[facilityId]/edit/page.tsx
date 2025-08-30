import { getFacilityById } from "@/actions/facility-actions";
import { FacilityForm } from "@/components/dashboard/facility-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Force dynamic rendering since this route uses authentication
export const dynamic = "force-dynamic";

interface EditFacilityPageProps {
  params: Promise<{
    facilityId: string;
  }>;
}

export default async function EditFacilityPage({
  params,
}: EditFacilityPageProps) {
  let facility;
  const { facilityId } = await params;
  try {
    facility = await getFacilityById(facilityId);
  } catch (error) {
    console.error("Failed to fetch facility for editing:", error);
    notFound();
  }

  if (!facility) {
    notFound();
  }

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
            <h1 className="text-3xl font-bold tracking-tight">Edit Facility</h1>
            <p className="text-muted-foreground">
              Update facility information and settings
            </p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <FacilityForm initialData={facility} isEditing={true} />
    </div>
  );
}
