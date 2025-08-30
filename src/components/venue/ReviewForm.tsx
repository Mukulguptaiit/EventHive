"use client";

import { useState } from "react";
import { Star, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { submitVenueReview, updateVenueReview } from "@/actions/venue-actions";
import { toast } from "sonner";

interface ReviewFormProps {
  venueId: string;
  venueName: string;
  existingReview?: {
    id: string;
    rating: number;
    comment: string | null;
  } | null;
  onReviewSubmitted?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({
  venueId,
  venueName,
  existingReview,
  onReviewSubmitted,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!existingReview;

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating: number) => {
    setHoveredRating(starRating);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);

    try {
      let result;
      if (isEditing && existingReview) {
        result = await updateVenueReview(existingReview.id, rating, comment);
      } else {
        result = await submitVenueReview(venueId, rating, comment);
      }

      if (result.success) {
        toast.success(
          isEditing
            ? "Review updated successfully!"
            : "Review submitted successfully!",
        );
        onReviewSubmitted?.();
      } else {
        toast.error(result.error || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (ratingValue: number) => {
    switch (ratingValue) {
      case 1:
        return "Poor";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Very Good";
      case 5:
        return "Excellent";
      default:
        return "Select Rating";
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{isEditing ? "Update Your Review" : "Write a Review"}</span>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
            {venueName}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Rating *</label>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="rounded transition-transform hover:scale-110 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 focus:outline-none"
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => handleStarHover(star)}
                    onMouseLeave={handleStarLeave}
                  >
                    <Star
                      className={cn(
                        "h-8 w-8 transition-colors",
                        star <= (hoveredRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 hover:text-yellow-200",
                      )}
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {getRatingText(hoveredRating || rating)}
              </span>
            </div>
          </div>

          {/* Comment Section */}
          <div className="space-y-3">
            <label htmlFor="comment" className="text-sm font-medium">
              Your Review (Optional)
            </label>
            <Textarea
              id="comment"
              placeholder="Share your experience with this venue..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
              maxLength={500}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                Help others by sharing specific details about your experience
              </span>
              <span>{comment.length}/500</span>
            </div>
          </div>

          {/* Review Guidelines */}
          <div className="rounded-lg bg-blue-50 p-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <div className="text-xs text-blue-800">
                <p className="mb-1 font-medium">Review Guidelines:</p>
                <ul className="space-y-1">
                  <li>• Be honest and specific about your experience</li>
                  <li>• Focus on the venue facilities and service quality</li>
                  <li>• Keep your review respectful and constructive</li>
                  <li>
                    • Reviews are verified if you&apos;ve booked at this venue
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={rating === 0 || isSubmitting}
              className="min-w-32"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Submitting..."}
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {isEditing ? "Update Review" : "Submit Review"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
