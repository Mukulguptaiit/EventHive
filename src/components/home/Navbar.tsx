"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Menu, X, Calendar, User, LogOut, Settings, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const user = session?.user;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    // Properly sign out via auth client
    authClient.signOut().finally(() => {
      router.refresh();
    });
  };

  const handleCreateEvent = () => {
    if (!user) {
      router.push("/auth/login?redirect=/dashboard/create-event");
      return;
    }
    router.push("/dashboard/create-event");
  };

  const handleProfile = () => {
    router.push("/dashboard/profile");
  };

  const handleSettings = () => {
    router.push("/dashboard/settings");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className={`text-xl font-bold ${isScrolled ? "text-gray-900" : "text-white"}`}>
              EventHive
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="/events"
              className={`font-medium transition-colors ${
                isScrolled ? "text-gray-700 hover:text-orange-600" : "text-white/90 hover:text-white"
              }`}
            >
              Discover Events
            </a>
            <a
              href="/dashboard/create-event"
              className={`font-medium transition-colors ${
                isScrolled ? "text-gray-700 hover:text-orange-600" : "text-white/90 hover:text-white"
              }`}
            >
              Create Event
            </a>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-white/90 backdrop-blur-sm border-gray-200 focus:border-orange-500 focus:ring-orange-500"
              />
            </form>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              onClick={handleCreateEvent}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>

            {sessionLoading ? null : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-0 h-auto">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image || undefined} alt={user.name ?? "User"} />
                      <AvatarFallback className="bg-orange-100 text-orange-600">
                        {getInitials(user.name ?? user.email ?? "U")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium">{user.name ?? "User"}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <DropdownMenuItem onClick={handleProfile}>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSettings}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => router.push("/auth/login")}>Sign in</Button>
                <Button onClick={() => router.push("/auth/signup")} className="bg-orange-600 hover:bg-orange-700 text-white">Sign up</Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-0 h-auto"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className={`h-6 w-6 ${isScrolled ? "text-gray-900" : "text-white"}`} />
            ) : (
              <Menu className={`h-6 w-6 ${isScrolled ? "text-gray-900" : "text-white"}`} />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
  {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white/95 backdrop-blur-md">
            <div className="space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 bg-white border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                />
              </form>

              {/* Mobile Navigation */}
              <div className="space-y-2">
                <a
                  href="/events"
                  className="block px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Discover Events
                </a>
                <a
                  href="/dashboard/create-event"
                  className="block px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Create Event
                </a>
              </div>

              {/* Mobile User Menu */}
              <div className="pt-4 border-t border-gray-200">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image || undefined} alt={user.name ?? "User"} />
                        <AvatarFallback className="bg-orange-100 text-orange-600">
                          {getInitials(user.name ?? user.email ?? "U")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name ?? "User"}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="space-y-1 mt-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start px-3 py-2 h-auto text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                        onClick={() => {
                          handleProfile();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start px-3 py-2 h-auto text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                        onClick={() => {
                          handleSettings();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start px-3 py-2 h-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 px-3">
                    <Button variant="outline" className="flex-1" onClick={() => { router.push("/auth/login"); setIsMobileMenuOpen(false); }}>Sign in</Button>
                    <Button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white" onClick={() => { router.push("/auth/signup"); setIsMobileMenuOpen(false); }}>Sign up</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
