import { getFacilityById } from "@/actions/facility-actions";
import { FacilityDetails } from "@/components/dashboard/facility-details";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Building2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Force dynamic rendering since this route uses authentication
export const dynamic = "force-dynamic";

interface FacilityPageProps {
  params: Promise<{
    facilityId: string;
  }>;
}

export default async function FacilityPage({ params }: FacilityPageProps) {
  let facility;
  const { facilityId } = await params;
  try {
    facility = await getFacilityById(facilityId);
  } catch (error) {
    console.error("Failed to fetch facility:", error);
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
            <Link href="/dashboard/facilities">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Facilities
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {facility.name}
            </h1>
            <p className="text-muted-foreground">{facility.address}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/facilities/${facilityId}/courts`}>
              <Building2 className="mr-2 h-4 w-4" />
              Manage Courts
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/facilities/${facilityId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Facility
            </Link>
          </Button>
        </div>
      </div>

      {/* Facility Details */}
      <FacilityDetails facility={facility} />
    </div>
  );
}
