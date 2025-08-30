import { FacilityForm } from "@/components/dashboard/facility-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewFacilityPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/facilities">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Facilities
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Facility</h1>
          <p className="text-muted-foreground">
            Add a new sports facility to your portfolio
          </p>
        </div>
      </div>

      {/* Facility Form */}
      <FacilityForm />
    </div>
  );
}
