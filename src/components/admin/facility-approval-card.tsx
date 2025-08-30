"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Building2,
  MapPin,
  User,
  Mail,
  Phone,
  Check,
  X,
  Eye,
  Calendar,
  Activity,
} from "lucide-react";
import { approveFacility, rejectFacility } from "@/actions/admin-actions";
import { toast } from "sonner";

interface FacilityApprovalCardProps {
  facility: {
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
    createdAt: Date;
    owner: {
      id: string;
      user: {
        name: string;
        email: string;
      };
    };
    courts: Array<{
      id: string;
      name: string;
      sportType: string;
    }>;
  };
}

export function FacilityApprovalCard({ facility }: FacilityApprovalCardProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      await approveFacility(facility.id);
      toast.success(`${facility.name} has been approved!`);
    } catch (error) {
      toast.error("Failed to approve facility");
      console.error(error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setIsRejecting(true);
      await rejectFacility(facility.id, rejectionReason);
      toast.success(`${facility.name} has been rejected`);
      setRejectionReason("");
    } catch (error) {
      toast.error("Failed to reject facility");
      console.error(error);
    } finally {
      setIsRejecting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {facility.name}
            </CardTitle>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              {facility.address}
            </div>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              Submitted {formatDate(facility.createdAt)}
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-orange-300 text-orange-600"
          >
            Pending Review
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Owner Information */}
        <div className="space-y-2 rounded-lg bg-gray-50 p-3">
          <h4 className="flex items-center gap-2 font-medium">
            <User className="h-4 w-4" />
            Owner Information
          </h4>
          <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Name:</span>
              {facility.owner.user.name}
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3" />
              {facility.owner.user.email}
            </div>
            {facility.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                {facility.phone}
              </div>
            )}
          </div>
        </div>

        {/* Quick Overview */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-2 text-center">
            <div className="text-lg font-semibold text-blue-600">
              {facility.courts.length}
            </div>
            <div className="text-xs text-blue-600">Courts</div>
          </div>
          <div className="rounded-lg bg-green-50 p-2 text-center">
            <div className="text-lg font-semibold text-green-600">
              {facility.amenities.length}
            </div>
            <div className="text-xs text-green-600">Amenities</div>
          </div>
          <div className="rounded-lg bg-purple-50 p-2 text-center">
            <div className="text-lg font-semibold text-purple-600 capitalize">
              {facility.venueType.toLowerCase()}
            </div>
            <div className="text-xs text-purple-600">Venue Type</div>
          </div>
        </div>

        {/* Sports Types */}
        <div>
          <h5 className="mb-2 flex items-center gap-2 font-medium">
            <Activity className="h-4 w-4" />
            Sports Available
          </h5>
          <div className="flex flex-wrap gap-1">
            {Array.from(
              new Set(facility.courts.map((court) => court.sportType)),
            ).map((sport) => (
              <Badge key={sport} variant="secondary" className="text-xs">
                {sport}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{facility.name} - Full Details</DialogTitle>
                <DialogDescription>
                  Complete facility information for review
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {facility.description && (
                  <div>
                    <h4 className="mb-2 font-medium">Description</h4>
                    <p className="text-muted-foreground text-sm">
                      {facility.description}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="mb-2 font-medium">
                    Courts ({facility.courts.length})
                  </h4>
                  <div className="space-y-2">
                    {facility.courts.map((court) => (
                      <div
                        key={court.id}
                        className="flex items-center justify-between rounded bg-gray-50 p-2"
                      >
                        <span className="font-medium">{court.name}</span>
                        <Badge variant="outline">{court.sportType}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {facility.amenities.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-medium">Amenities</h4>
                    <div className="flex flex-wrap gap-1">
                      {facility.amenities.map((amenity, index) => (
                        <Badge key={index} variant="secondary">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {facility.policies.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-medium">Policies</h4>
                    <ul className="space-y-1 text-sm">
                      {facility.policies.map((policy, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-muted-foreground">•</span>
                          {policy}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button
            onClick={handleApprove}
            disabled={isApproving || isRejecting}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Check className="mr-2 h-4 w-4" />
            {isApproving ? "Approving..." : "Approve"}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={isApproving || isRejecting}
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reject Facility</AlertDialogTitle>
                <AlertDialogDescription>
                  Please provide a reason for rejecting {facility.name}. This
                  will be sent to the facility owner.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || isRejecting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isRejecting ? "Rejecting..." : "Confirm Rejection"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
