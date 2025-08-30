"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Phone,
  Mail,
  Star,
  Users,
  Clock,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
} from "lucide-react";
import Link from "next/link";

interface Court {
  id: string;
  name: string;
  sportType: string;
  pricePerHour: number;
  operatingStartHour: number;
  operatingEndHour: number;
  isActive: boolean;
  activeBookings: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  playerName: string;
  createdAt: string;
}

interface FacilityData {
  id: string;
  name: string;
  description: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  amenities: string[];
  photos: string[];
  phone: string | null;
  email: string | null;
  policies: string[];
  venueType: string;
  status: string;
  rating: number | null;
  reviewCount: number;
  courts: Court[];
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
}

interface FacilityDetailsProps {
  facility: FacilityData;
}

export function FacilityDetails({ facility }: FacilityDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return { icon: CheckCircle, className: "text-green-600 bg-green-100" };
      case "PENDING":
        return {
          icon: AlertCircle,
          className: "text-yellow-600 bg-yellow-100",
        };
      case "REJECTED":
        return { icon: XCircle, className: "text-red-600 bg-red-100" };
      default:
        return { icon: AlertCircle, className: "text-gray-600 bg-gray-100" };
    }
  };

  const formatTime = (hour: number) => {
    return hour === 0
      ? "12:00 AM"
      : hour < 12
        ? `${hour}:00 AM`
        : hour === 12
          ? "12:00 PM"
          : `${hour - 12}:00 PM`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const statusInfo = getStatusColor(facility.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <StatusIcon className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{facility.status}</div>
            <Badge className={`mt-1 ${statusInfo.className}`}>
              {facility.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courts</CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{facility.courts.length}</div>
            <p className="text-muted-foreground text-xs">
              {facility.courts.filter((c) => c.isActive).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-2xl font-bold">
              {facility.rating ? facility.rating.toFixed(1) : "N/A"}
              {facility.rating && (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              )}
            </div>
            <p className="text-muted-foreground text-xs">
              {facility.reviewCount} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Type</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{facility.venueType}</div>
            <p className="text-muted-foreground text-xs">Venue type</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Facility Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {facility.description && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-900">
                  Description
                </h4>
                <p className="text-sm text-gray-600">{facility.description}</p>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-gray-600">{facility.address}</p>
                </div>
              </div>

              {facility.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-gray-600">{facility.phone}</p>
                  </div>
                </div>
              )}

              {facility.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-gray-600">{facility.email}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(facility.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amenities & Policies */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities & Policies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {facility.amenities.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-900">
                  Amenities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {facility.amenities.map((amenity) => (
                    <Badge
                      key={amenity}
                      variant="secondary"
                      className="text-xs"
                    >
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {facility.policies.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-900">
                  Policies
                </h4>
                <div className="space-y-1">
                  {facility.policies.map((policy, index) => (
                    <p
                      key={index}
                      className="flex items-start gap-2 text-xs text-gray-600"
                    >
                      <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-green-500" />
                      {policy}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Courts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Courts</CardTitle>
              <CardDescription>
                Manage courts and their configurations
              </CardDescription>
            </div>
            <Button asChild>
              <Link href={`/dashboard/facilities/${facility.id}/courts/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Court
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {facility.courts.length === 0 ? (
            <div className="py-8 text-center">
              <Activity className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                No courts yet
              </h3>
              <p className="mb-4 text-gray-500">
                Add courts to start accepting bookings.
              </p>
              <Button asChild>
                <Link href={`/dashboard/facilities/${facility.id}/courts/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Court
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {facility.courts.map((court) => (
                <Card key={court.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{court.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {court.sportType}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge
                          variant={court.isActive ? "default" : "secondary"}
                        >
                          {court.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            href={`/dashboard/facilities/${facility.id}/courts/${court.id}/time-slots`}
                          >
                            <Clock className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            href={`/dashboard/facilities/${facility.id}/courts/${court.id}/edit`}
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Default Price per hour
                      </span>
                      <span className="font-medium">₹{court.pricePerHour}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Operating hours
                      </span>
                      <span className="text-sm font-medium">
                        {formatTime(court.operatingStartHour)} -{" "}
                        {formatTime(court.operatingEndHour)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Active bookings
                      </span>
                      <span className="font-medium">
                        {court.activeBookings}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      {facility.reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
            <CardDescription>Latest customer feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {facility.reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-gray-200 pb-4 last:border-b-0"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {review.playerName}
                      </span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-600">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
