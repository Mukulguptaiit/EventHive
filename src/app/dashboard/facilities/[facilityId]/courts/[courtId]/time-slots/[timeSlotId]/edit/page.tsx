import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getTimeSlotById } from "@/actions/time-slot-actions";
import { TimeSlotForm } from "@/components/dashboard/time-slot-form";

// Force dynamic rendering since this route uses authentication
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    facilityId: string;
    courtId: string;
    timeSlotId: string;
  }>;
}

export default async function EditTimeSlotPage({ params }: PageProps) {
  const { facilityId, courtId, timeSlotId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/login");
  }

  try {
    const timeSlot = await getTimeSlotById(timeSlotId);

    // Verify the time slot belongs to the correct court and facility
    if (
      timeSlot.courtId !== courtId ||
      timeSlot.court.facility.id !== facilityId
    ) {
      notFound();
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Time Slot</h1>
          <p className="text-muted-foreground">
            Modify the time slot for {timeSlot.court.name} at{" "}
            {timeSlot.court.facility.name}
          </p>
        </div>

        <TimeSlotForm
          courtId={courtId}
          facilityId={facilityId}
          initialData={{
            id: timeSlot.id,
            date: timeSlot.startTime.toISOString().split("T")[0],
            startTime: timeSlot.startTime.toTimeString().substring(0, 5),
            endTime: timeSlot.endTime.toTimeString().substring(0, 5),
            price: timeSlot.price || undefined,
            isMaintenanceBlocked: timeSlot.isMaintenanceBlocked,
            maintenanceReason: timeSlot.maintenanceReason || "",
          }}
          isEditing={true}
        />
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch time slot:", error);
    notFound();
  }
}
