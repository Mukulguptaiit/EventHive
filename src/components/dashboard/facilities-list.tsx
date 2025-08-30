"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Phone,
  Mail,
  Star,
  Users,
  Activity,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { deleteFacility } from "@/actions/facility-actions";
import { toast } from "sonner";
import Image from "next/image";

interface Facility {
  id: string;
  name: string;
  description: string | null;
  address: string;
  amenities: string[];
  photos: string[];
  phone: string | null;
  email: string | null;
  policies: string[];
  venueType: string;
  status: string;
  rating: number | null;
  reviewCount: number;
  courtsCount: number;
  courts: Array<{
    id: string;
    name: string;
    sportType: string;
    isActive: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface FacilitiesListProps {
  facilities: Facility[];
  error?: string | null;
}

export function FacilitiesList({ facilities, error }: FacilitiesListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [facilityToDelete, setFacilityToDelete] = useState<Facility | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = (facility: Facility) => {
    setFacilityToDelete(facility);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!facilityToDelete) return;

    try {
      setDeleting(true);
      await deleteFacility(facilityToDelete.id);
      toast.success("Facility deleted successfully");
      setDeleteDialogOpen(false);
      setFacilityToDelete(null);
      // Refresh the page to update the list
      window.location.reload();
    } catch (err) {
      console.error("Failed to delete facility:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to delete facility",
      );
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSportTypeColors = () => {
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-orange-100 text-orange-800",
      "bg-pink-100 text-pink-800",
    ];
    return colors;
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <AlertCircle className="mx-auto mb-2 h-8 w-8" />
            <p className="font-medium">Error loading facilities</p>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (facilities.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-gray-100 p-3">
              <Activity className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              No events yet
            </h3>
            <p className="mb-4 text-gray-500">
              Get started by creating your first event.
            </p>
            <Button asChild>
              <Link href="/dashboard/facilities/new">Create Event</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {facilities.map((facility) => {
          const sportTypes = [
            ...new Set(facility.courts.map((court) => court.sportType)),
          ];
          const colorClasses = getSportTypeColors();

          return (
            <Card key={facility.id} className="overflow-hidden">
              <div className="relative aspect-video bg-gray-200">
                {facility.photos.length > 0 ? (
                  <Image
                    src={facility.photos[0]}
                    alt={facility.name}
                    className="h-full w-full object-cover"
                    fill
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Activity className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge className={getStatusColor(facility.status)}>
                    {facility.status}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate text-lg">
                      {facility.name}
                    </CardTitle>
                    <div className="mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <CardDescription className="truncate text-xs">
                        {facility.address}
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/facilities/${facility.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/dashboard/facilities/${facility.id}/edit`}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => handleDeleteClick(facility)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                {/* Rating and Reviews */}
                {facility.rating && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {facility.rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      ({facility.reviewCount} reviews)
                    </span>
                  </div>
                )}

                {/* Sport Types */}
                <div className="flex flex-wrap gap-1">
                  {sportTypes.slice(0, 3).map((sport, index) => (
                    <Badge
                      key={sport}
                      variant="secondary"
                      className={`text-xs ${colorClasses[index % colorClasses.length]}`}
                    >
                      {sport}
                    </Badge>
                  ))}
                  {sportTypes.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{sportTypes.length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{facility.courtsCount} courts</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {facility.venueType}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-1">
                  {facility.phone && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Phone className="h-3 w-3" />
                      <span>{facility.phone}</span>
                    </div>
                  )}
                  {facility.email && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{facility.email}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {facility.description && (
                  <p className="line-clamp-2 text-xs text-gray-600">
                    {facility.description}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Facility</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{facilityToDelete?.name}
              &quot;? This action cannot be undone and will remove all
              associated courts and data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
