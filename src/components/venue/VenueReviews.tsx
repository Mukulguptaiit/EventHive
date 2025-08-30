"use client";

import { useState, useEffect } from "react";
import { Star, User, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Review interface matching the database structure
export interface VenueReview {
  id: string;
  rating: number;
  comment: string | null;
  verified: boolean;
  createdAt: Date;
  player: {
    user: {
      name: string;
    };
  };
}

interface VenueReviewsProps {
  venueId: string;
  reviews: VenueReview[];
  averageRating: number;
  totalReviews: number;
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export default function VenueReviews({
  venueId,
  reviews,
  averageRating,
  totalReviews,
  loading = false,
  onLoadMore,
  hasMore = false,
}: VenueReviewsProps) {
  const [displayedReviews, setDisplayedReviews] = useState<VenueReview[]>([]);

  useEffect(() => {
    setDisplayedReviews(reviews);
  }, [reviews]);

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((review) => review.rating === rating).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { rating, count, percentage };
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "h-3 w-3",
      md: "h-4 w-4",
      lg: "h-5 w-5",
    };

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizeClasses[size],
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300",
            )}
          />
        ))}
      </div>
    );
  };

  if (loading && displayedReviews.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-40 items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-emerald-600" />
            <p className="text-sm text-gray-600">Loading reviews...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Reviews & Ratings</span>
            <Badge
              variant="secondary"
              className="bg-emerald-100 text-emerald-800"
            >
              {totalReviews} reviews
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-emerald-600">
                {averageRating.toFixed(1)}
              </div>
              <div className="mb-2 flex justify-center">
                {renderStars(Math.round(averageRating), "lg")}
              </div>
              <p className="text-sm text-gray-600">
                Based on {totalReviews} reviews
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-emerald-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-8 text-sm text-gray-600">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {displayedReviews.length === 0 ? (
          <Card>
            <CardContent className="flex h-32 items-center justify-center">
              <div className="text-center">
                <AlertCircle className="mx-auto mb-2 h-6 w-6 text-gray-400" />
                <p className="text-sm text-gray-600">No reviews yet</p>
                <p className="text-xs text-gray-500">
                  Be the first to review this venue!
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          displayedReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                    <User className="h-5 w-5 text-emerald-600" />
                  </div>

                  {/* Review Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">
                          {review.player.user.name}
                        </h4>
                        {review.verified && (
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800"
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {renderStars(review.rating)}
                      <span className="text-sm font-medium">
                        {review.rating}/5
                      </span>
                    </div>

                    {review.comment && (
                      <p className="leading-relaxed text-gray-700">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={onLoadMore}
              disabled={loading}
              className="min-w-32"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load More Reviews"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
