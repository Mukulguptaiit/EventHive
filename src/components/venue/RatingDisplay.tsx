"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingDisplayProps {
  rating: number;
  maxRating?: number;
  size?: "xs" | "sm" | "md" | "lg";
  showNumber?: boolean;
  showTotal?: boolean;
  totalReviews?: number;
  className?: string;
}

export default function RatingDisplay({
  rating,
  maxRating = 5,
  size = "md",
  showNumber = true,
  showTotal = false,
  totalReviews,
  className,
}: RatingDisplayProps) {
  const sizeClasses = {
    xs: "h-2.5 w-2.5",
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textSizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-sm",
    lg: "text-base",
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className={cn(sizeClasses[size], "fill-yellow-400 text-yellow-400")}
        />,
      );
    }

    // Half star
    if (hasHalfStar && fullStars < maxRating) {
      stars.push(
        <div key="half" className="relative">
          <Star className={cn(sizeClasses[size], "text-gray-300")} />
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: "50%" }}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "fill-yellow-400 text-yellow-400",
              )}
            />
          </div>
        </div>,
      );
    }

    // Empty stars
    const emptyStars = maxRating - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star
          key={`empty-${i}`}
          className={cn(sizeClasses[size], "text-gray-300")}
        />,
      );
    }

    return stars;
  };

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <div className="flex items-center space-x-0.5">{renderStars()}</div>

      {showNumber && (
        <span
          className={cn("font-medium text-gray-900", textSizeClasses[size])}
        >
          {rating.toFixed(1)}
        </span>
      )}

      {showTotal && totalReviews !== undefined && (
        <span className={cn("text-gray-500", textSizeClasses[size])}>
          ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
        </span>
      )}
    </div>
  );
}
