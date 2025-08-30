import { SessionGuard } from "@/components/auth/session-guard";
import { Navbar } from "@/components/home/Navbar";
import { UserRole } from "@/types/venue";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SessionGuard
      requiredRoles={[UserRole.FACILITY_OWNER, UserRole.ADMIN]}
      requireEmailVerification={true}
    >
      <Navbar />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {children}
          </div>
        </div>
      </div>
    </SessionGuard>
  );
}
