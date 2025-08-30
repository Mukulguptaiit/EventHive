import { AdminProfile } from "@/components/admin/admin-profile";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/types/venue";

export default async function AdminProfilePage() {
  // Check authentication and admin role
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/login");
  }

  const userProfile = await prisma.playerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
    },
  });

  if (!userProfile || userProfile.role !== UserRole.ADMIN) {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminProfile profile={userProfile} />
    </div>
  );
}
