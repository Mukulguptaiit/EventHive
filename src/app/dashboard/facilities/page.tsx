import { getUserFacilities } from "@/actions/facility-actions";
import { FacilitiesList } from "@/components/dashboard/facilities-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

// Force dynamic rendering since this route uses authentication
export const dynamic = "force-dynamic";

export default async function FacilitiesPage() {
  let facilities;
  let error = null;

  try {
    facilities = await getUserFacilities();
  } catch (err) {
    console.error("Failed to fetch facilities:", err);
    error = err instanceof Error ? err.message : "Failed to fetch facilities";
    facilities = [];
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facilities</h1>
          <p className="text-muted-foreground">
            Manage your sports facilities and courts
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/facilities/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Facility
          </Link>
        </Button>
      </div>

      {/* Facilities List */}
      <FacilitiesList facilities={facilities} error={error} />
    </div>
  );
}
