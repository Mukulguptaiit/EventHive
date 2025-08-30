"use client";

import {
  LogIn,
  User,
  LogOut,
  Calendar,
  BarChart3,
  Settings,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  // Get user role from session
  const userRole = session?.user?.role || "USER";

  // Determine what navigation links to show based on role
  const canAccessDashboard =
    userRole === "FACILITY_OWNER" || userRole === "ADMIN";
  const canAccessAdmin = userRole === "ADMIN";

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100 bg-white/80 shadow-sm backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-2xl font-bold text-transparent">
              <Link href={"/"}>EventHive</Link>
            </div>
            <nav className="hidden space-x-6 md:flex">
              <Link
                href="/venues"
                className="text-gray-600 transition-colors hover:text-emerald-600"
              >
                Events
              </Link>
              {canAccessDashboard && (
                <Link
                  href="/dashboard"
                  className="text-gray-600 transition-colors hover:text-emerald-600"
                >
                  Dashboard
                </Link>
              )}
              {canAccessAdmin && (
                <Link
                  href="/admin"
                  className="text-gray-600 transition-colors hover:text-emerald-600"
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/venues"
              className={buttonVariants({
                variant: "ghost",
                class: "hidden items-center space-x-2 text-emerald-600 sm:flex",
              })}
            >
              <Calendar className="h-4 w-4" />
              <span>Book</span>
            </Link>
            <div className="flex items-center gap-3">
              {isPending ? (
                <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
              ) : session?.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-10 w-10 cursor-pointer">
                      <AvatarImage
                        src={session.user.image ?? ""}
                        alt={session.user.name ?? "User"}
                      />
                      <AvatarFallback className="text-base">
                        {session.user.name?.charAt(0)?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60">
                    <DropdownMenuItem asChild>
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 py-3"
                      >
                        <User className="h-5 w-5" />
                        <span className="text-base">Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    {canAccessDashboard && (
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 py-3"
                        >
                          <BarChart3 className="h-5 w-5" />
                          <span className="text-base">Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {canAccessAdmin && (
                      <DropdownMenuItem asChild>
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 py-3"
                        >
                          <Settings className="h-5 w-5" />
                          <span className="text-base">Admin Panel</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center gap-3 py-3 text-red-600"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="text-base">Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                  href="/auth/login"
                >
                  <LogIn className="h-5 w-5" />
                  <span className="text-base">Login / Sign Up</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
