import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { TimeSlotForm } from "@/components/dashboard/time-slot-form";
import { checkCourtAccess } from "@/lib/auth-utils";

// Force dynamic rendering since this route uses authentication
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    facilityId: string;
    courtId: string;
  }>;
}

export default async function NewTimeSlotPage({ params }: PageProps) {
  const { facilityId, courtId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Get the court and verify access
  const court = await prisma.court.findUnique({
    where: { id: courtId },
    include: {
      facility: {
        select: {
          id: true,
          name: true,
          ownerId: true,
        },
      },
    },
  });

  if (!court || court.facilityId !== facilityId) {
    notFound();
  }

  // Check authorization
  const userRole = session.user.role;
  const hasAccess = await checkCourtAccess(session.user.id, userRole, courtId);

  if (!hasAccess) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Time Slot</h1>
        <p className="text-muted-foreground">
          Add a new time slot for {court.name} at {court.facility.name}
        </p>
      </div>

      <TimeSlotForm
        courtId={courtId}
        facilityId={facilityId}
        isEditing={false}
      />
    </div>
  );
}
