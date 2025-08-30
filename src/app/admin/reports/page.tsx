import { AdminReports } from "@/components/admin/admin-reports";
import { getAllReports } from "@/actions/report-actions";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/types/venue";

export default async function AdminReportsPage({
  searchParams: _searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  // Check authentication and admin role
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/login");
  }

  const userProfile = await prisma.playerProfile.findUnique({
    where: { userId: session.user.id },
    select: { role: true },
  });

  if (!userProfile || userProfile.role !== UserRole.ADMIN) {
    redirect("/dashboard");
  }

  // Fetch reports
  const result = await getAllReports();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch reports");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminReports reports={result.data || []} />
    </div>
  );
}
