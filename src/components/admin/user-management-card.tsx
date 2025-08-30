"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  User,
  Mail,
  Phone,
  Shield,
  Eye,
  Calendar,
  Building2,
  Activity,
  Ban,
  UserCheck,
} from "lucide-react";
import {
  banUser,
  unbanUser,
  getUserBookingHistory,
} from "@/actions/admin-actions";
import { toast } from "sonner";

interface UserManagementCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
    playerProfile: {
      id: string;
      role: string;
      phoneNumber: string | null;
      isActive: boolean;
      isBanned: boolean;
      bannedUntil: Date | null;
      _count: {
        bookings: number;
        ownedFacilities: number;
      };
    } | null;
  };
  onUserUpdated?: () => void;
}

export function UserManagementCard({
  user,
  onUserUpdated,
}: UserManagementCardProps) {
  const [isBanning, setIsBanning] = useState(false);
  const [isUnbanning, setIsUnbanning] = useState(false);
  const [showBookings, setShowBookings] = useState(false);
  const [bookingHistory, setBookingHistory] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const profile = user.playerProfile;
  const isBanned = profile?.isBanned || false;
  const isActive = profile?.isActive ?? true;

  const handleBanUser = async () => {
    try {
      setIsBanning(true);
      await banUser(user.id);
      toast.success(`${user.name} has been banned`);
      onUserUpdated?.(); // Refresh the user list
    } catch (error) {
      toast.error("Failed to ban user");
      console.error(error);
    } finally {
      setIsBanning(false);
    }
  };

  const handleUnbanUser = async () => {
    try {
      setIsUnbanning(true);
      await unbanUser(user.id);
      toast.success(`${user.name} has been unbanned`);
      onUserUpdated?.(); // Refresh the user list
    } catch (error) {
      toast.error("Failed to unban user");
      console.error(error);
    } finally {
      setIsUnbanning(false);
    }
  };

  const loadBookingHistory = async () => {
    if (bookingHistory.length > 0) return; // Already loaded

    try {
      setLoadingBookings(true);
      const history = await getUserBookingHistory(user.id);
      setBookingHistory(history);
    } catch (error) {
      toast.error("Failed to load booking history");
      console.error(error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "FACILITY_OWNER":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className={`w-full ${isBanned ? "border-red-200 bg-red-50/30" : ""}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {user.name}
              {isBanned && <Ban className="h-4 w-4 text-red-600" />}
            </CardTitle>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4" />
              {user.email}
            </div>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              Joined {formatDate(user.createdAt)}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge
              className={getRoleColor(profile?.role || "USER")}
              variant="secondary"
            >
              {profile?.role || "USER"}
            </Badge>
            {!isActive && (
              <Badge variant="destructive" className="text-xs">
                Inactive
              </Badge>
            )}
            {isBanned && (
              <Badge variant="destructive" className="text-xs">
                Banned
              </Badge>
            )}
            {user.emailVerified && (
              <Badge variant="outline" className="text-xs">
                ✓ Verified
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Information */}
        {profile?.phoneNumber && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="text-muted-foreground h-4 w-4" />
            {profile.phoneNumber}
          </div>
        )}

        {/* Activity Stats */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-2 text-center">
            <div className="text-lg font-semibold text-blue-600">
              {profile?._count.bookings || 0}
            </div>
            <div className="text-xs text-blue-600">Bookings</div>
          </div>
          <div className="rounded-lg bg-green-50 p-2 text-center">
            <div className="text-lg font-semibold text-green-600">
              {profile?._count.ownedFacilities || 0}
            </div>
            <div className="text-xs text-green-600">Facilities</div>
          </div>
          <div className="rounded-lg bg-purple-50 p-2 text-center">
            <div className="text-lg font-semibold text-purple-600">
              {isActive ? "Active" : "Inactive"}
            </div>
            <div className="text-xs text-purple-600">Status</div>
          </div>
        </div>

        {/* Ban Notice */}
        {isBanned && profile?.bannedUntil && (
          <div className="rounded-lg border border-red-200 bg-red-100 p-3">
            <p className="text-sm text-red-800">
              <strong>Banned until:</strong> {formatDate(profile.bannedUntil)}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <Dialog open={showBookings} onOpenChange={setShowBookings}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex-1"
                onClick={loadBookingHistory}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Bookings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{user.name} - Booking History</DialogTitle>
                <DialogDescription>
                  Last 50 bookings for this user
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {loadingBookings ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
                  </div>
                ) : bookingHistory.length === 0 ? (
                  <div className="py-8 text-center">
                    <Activity className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <p className="text-muted-foreground">No bookings found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bookingHistory.map((booking, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                      >
                        <div>
                          <p className="font-medium">
                            {booking.timeSlot?.court?.facility?.name ||
                              "Unknown Facility"}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {booking.timeSlot?.court?.name} -{" "}
                            {booking.timeSlot?.court?.sportType}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {formatDate(booking.createdAt)}
                          </p>
                        </div>
                        <Badge
                          variant={
                            booking.status === "CONFIRMED"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {profile?.role === "FACILITY_OWNER" && (
            <Button variant="outline" className="flex-1" asChild>
              <a href={`/admin/facilities?owner=${user.id}`}>
                <Building2 className="mr-2 h-4 w-4" />
                View Facilities
              </a>
            </Button>
          )}

          {isBanned ? (
            <Button
              onClick={handleUnbanUser}
              disabled={isUnbanning}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <UserCheck className="mr-2 h-4 w-4" />
              {isUnbanning ? "Unbanning..." : "Unban User"}
            </Button>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={isBanning}
                  className="flex-1"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Ban User
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Ban User</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to ban {user.name}? This will prevent
                    them from accessing the platform.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBanUser}
                    disabled={isBanning}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isBanning ? "Banning..." : "Confirm Ban"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
