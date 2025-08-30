"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Star,
  Trash2,
  User,
  Calendar,
  Building2,
  Search,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Shield,
  ShieldCheck,
} from "lucide-react";
import {
  deleteVenueReview,
  getAllReviews,
  toggleReviewVerification,
} from "@/actions/venue-actions";
import { toast } from "sonner";

interface AdminReview {
  id: string;
  rating: number;
  comment: string | null;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  player: {
    user: {
      name: string;
      email: string;
    };
  };
  facility: {
    name: string;
    id: string;
  };
}

interface AdminReviewsProps {
  reviews: AdminReview[];
  onReviewDeleted?: () => void;
  initialRatingFilter?: string;
}

export function AdminReviews({
  reviews: initialReviews,
  onReviewDeleted,
  initialRatingFilter = "ALL",
}: AdminReviewsProps) {
  const [reviews, setReviews] = useState<AdminReview[]>(initialReviews);
  const [filteredReviews, setFilteredReviews] = useState<AdminReview[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState(initialRatingFilter);
  const [verifiedFilter, setVerifiedFilter] = useState("ALL");
  const [deletingReview, setDeletingReview] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [togglingVerification, setTogglingVerification] = useState<
    string | null
  >(null);

  useEffect(() => {
    filterReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviews, searchTerm, ratingFilter, verifiedFilter]);

  const refreshReviews = async () => {
    try {
      setRefreshing(true);
      const result = await getAllReviews();
      if (result.success) {
        setReviews(result.data);
        toast.success("Reviews refreshed successfully");
      } else {
        toast.error(result.error || "Failed to refresh reviews");
      }
    } catch (error) {
      console.error("Error refreshing reviews:", error);
      toast.error("Failed to refresh reviews");
    } finally {
      setRefreshing(false);
    }
  };

  const filterReviews = useCallback(() => {
    let filtered = [...reviews];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (review) =>
          review.player.user.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          review.facility.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          review.comment?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Rating filter
    if (ratingFilter !== "ALL") {
      const rating = parseInt(ratingFilter);
      filtered = filtered.filter((review) => review.rating <= rating);
    }

    // Verified filter
    if (verifiedFilter !== "ALL") {
      const isVerified = verifiedFilter === "VERIFIED";
      filtered = filtered.filter((review) => review.verified === isVerified);
    }

    setFilteredReviews(filtered);
  }, [reviews, searchTerm, ratingFilter, verifiedFilter]);

  const handleDeleteReview = async (reviewId: string) => {
    try {
      setDeletingReview(reviewId);
      const result = await deleteVenueReview(reviewId);

      if (result.success) {
        setReviews((prevReviews) =>
          prevReviews.filter((review) => review.id !== reviewId),
        );
        toast.success("Review deleted successfully");
        onReviewDeleted?.();
      } else {
        toast.error(result.error || "Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    } finally {
      setDeletingReview(null);
    }
  };

  const handleToggleVerification = async (reviewId: string) => {
    try {
      setTogglingVerification(reviewId);
      const result = await toggleReviewVerification(reviewId);

      if (result.success) {
        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review.id === reviewId
              ? { ...review, verified: result.verified ?? review.verified }
              : review,
          ),
        );
        toast.success(
          `Review ${result.verified ? "verified" : "unverified"} successfully`,
        );
      } else {
        toast.error(result.error || "Failed to toggle verification");
      }
    } catch (error) {
      console.error("Error toggling verification:", error);
      toast.error("Failed to toggle verification");
    } finally {
      setTogglingVerification(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Review Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  placeholder="Search reviews by user, venue, or comment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshReviews}
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>

              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars ≤</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>

              <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by verification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Reviews</SelectItem>
                  <SelectItem value="VERIFIED">Verified</SelectItem>
                  <SelectItem value="UNVERIFIED">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Total Reviews
                </p>
                <p className="text-2xl font-bold">{reviews.length}</p>
              </div>
              <Star className="text-muted-foreground h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Verified Reviews
                </p>
                <p className="text-2xl font-bold">
                  {reviews.filter((r) => r.verified).length}
                </p>
              </div>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Average Rating
                </p>
                <p className="text-2xl font-bold">
                  {reviews.length > 0
                    ? (
                        reviews.reduce((sum, r) => sum + r.rating, 0) /
                        reviews.length
                      ).toFixed(1)
                    : "0.0"}
                </p>
              </div>
              <Star className="h-4 w-4 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Low Ratings
                </p>
                <p className="text-2xl font-bold">
                  {reviews.filter((r) => r.rating <= 2).length}
                </p>
              </div>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Reviews ({filteredReviews.length})
          </h2>
          <Badge variant="outline">
            {searchTerm && `Search: "${searchTerm}"`}
            {ratingFilter !== "ALL" && ` • ${ratingFilter} stars`}
            {verifiedFilter !== "ALL" && ` • ${verifiedFilter.toLowerCase()}`}
          </Badge>
        </div>

        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Star className="mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold">No Reviews Found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm ||
                ratingFilter !== "ALL" ||
                verifiedFilter !== "ALL"
                  ? "Try adjusting your search or filter criteria."
                  : "No reviews have been submitted yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {review.player.user.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {review.player.user.email}
                          </p>
                        </div>
                        {review.verified && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div className="mb-1 flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(review.createdAt)}</span>
                        </div>
                        {review.updatedAt > review.createdAt && (
                          <span className="text-xs">
                            Updated: {formatDate(review.updatedAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Venue Info */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Building2 className="h-4 w-4" />
                      <span>{review.facility.name}</span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-2">
                      {renderStars(review.rating)}
                      <span className="text-sm font-medium">
                        {review.rating}/5
                      </span>
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <p className="leading-relaxed text-gray-700">
                        {review.comment}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="ml-4 flex flex-col gap-2">
                    {/* Toggle Verification Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleVerification(review.id)}
                      disabled={togglingVerification === review.id}
                      title={
                        review.verified
                          ? "Click to remove verification"
                          : "Click to manually verify this review"
                      }
                      className={`${
                        review.verified
                          ? "text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          : "text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                      }`}
                    >
                      {review.verified ? (
                        <ShieldCheck className="h-4 w-4" />
                      ) : (
                        <Shield className="h-4 w-4" />
                      )}
                    </Button>

                    {/* Delete Button */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          disabled={deletingReview === review.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Review</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this review? This
                            action cannot be undone and will affect the
                            venue&apos;s overall rating.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteReview(review.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Review
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
