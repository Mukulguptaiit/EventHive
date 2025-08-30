"use client";

import React from "react";
import { Calendar, Clock, MapPin, Users, Star, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export interface Event {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  category: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  city: string;
  state: string;
  coverImage: string;
  isFree: boolean;
  minPrice?: number;
  maxPrice?: number;
  currentAttendees: number;
  maxAttendees: number;
  trending?: boolean;
  featured?: boolean;
  rating?: number;
  reviewCount?: number;
}

interface EventCardProps {
  event: Event;
  variant?: "default" | "compact" | "featured";
  onViewDetails?: (eventId: string) => void;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTime(timeString: string) {
  return timeString;
}

function formatPrice(minPrice: number, maxPrice: number) {
  if (minPrice === 0 && maxPrice === 0) return "Free";
  if (minPrice === maxPrice) return `₹${minPrice.toLocaleString()}`;
  return `₹${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`;
}

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    WORKSHOP: "bg-blue-100 text-blue-800",
    CONCERT: "bg-purple-100 text-purple-800",
    SPORTS: "bg-green-100 text-green-800",
    HACKATHON: "bg-orange-100 text-orange-800",
    BUSINESS: "bg-indigo-100 text-indigo-800",
    CONFERENCE: "bg-red-100 text-red-800",
    EXHIBITION: "bg-yellow-100 text-yellow-800",
    FESTIVAL: "bg-pink-100 text-pink-800",
    SEMINAR: "bg-teal-100 text-teal-800",
    WEBINAR: "bg-cyan-100 text-cyan-800",
    MEETUP: "bg-gray-100 text-gray-800",
    OTHER: "bg-gray-100 text-gray-800",
  };
  return colors[category] || colors.OTHER;
}

function getCategoryIcon(category: string) {
  const icons: Record<string, React.ReactNode> = {
    WORKSHOP: <Users className="h-4 w-4" />,
    CONCERT: <Zap className="h-4 w-4" />,
    SPORTS: <TrendingUp className="h-4 w-4" />,
    HACKATHON: <Zap className="h-4 w-4" />,
    BUSINESS: <Users className="h-4 w-4" />,
    CONFERENCE: <Users className="h-4 w-4" />,
    EXHIBITION: <Star className="h-4 w-4" />,
    FESTIVAL: <Star className="h-4 w-4" />,
    SEMINAR: <Users className="h-4 w-4" />,
    WEBINAR: <Users className="h-4 w-4" />,
    MEETUP: <Users className="h-4 w-4" />,
    OTHER: <Star className="h-4 w-4" />,
  };
  return icons[category] || icons.OTHER;
}

export function EventCard({ event, variant = "default", onViewDetails }: EventCardProps) {
  const handleViewDetails = () => onViewDetails?.(event.id);

  const ImageWithFallback: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`relative ${className || ""}`}>
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(251,146,60,0.25),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.2),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.2),transparent_40%)]"
        aria-hidden
      />
      <img
        src={event.coverImage || ""}
        alt={event.title}
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    </div>
  );

  if (variant === "compact") {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={handleViewDetails}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
              <ImageWithFallback className="w-20 h-20" />
              {event.trending && (
                <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Trending
                </Badge>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className={getCategoryColor(event.category)}>
                  {getCategoryIcon(event.category)}
                  {event.category}
                </Badge>
                {event.featured && (
                  <Badge className="bg-yellow-500 text-white text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{event.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(event.startDate)}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {event.city}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {event.currentAttendees}/{event.maxAttendees}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg text-orange-600">
                {formatPrice(event.minPrice || 0, event.maxPrice || 0)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "featured") {
    return (
      <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden" onClick={handleViewDetails}>
        <div className="relative h-48">
          <ImageWithFallback className="h-48" />
          <div className="absolute top-4 left-4 flex gap-2">
            {event.trending && (
              <Badge className="bg-orange-500 text-white">
                <TrendingUp className="h-4 w-4 mr-1" />
                Trending
              </Badge>
            )}
            {event.featured && (
              <Badge className="bg-yellow-500 text-white">
                <Star className="h-4 w-4 mr-1" />
                Featured
              </Badge>
            )}
          </div>
          <div className="absolute top-4 right-4">
            <Badge className="bg-black/70 text-white backdrop-blur-sm">
              {formatPrice(event.minPrice || 0, event.maxPrice || 0)}
            </Badge>
          </div>
          <div className="absolute bottom-4 left-4">
            <Badge className="bg-black/70 text-white backdrop-blur-sm">
              {formatDate(event.startDate)}
            </Badge>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className={getCategoryColor(event.category)}>
              {getCategoryIcon(event.category)}
              {event.category}
            </Badge>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
          <p className="text-gray-600 mb-4 line-clamp-2">{event.shortDescription || event.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {formatTime(event.startTime)}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {event.city}, {event.state}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              {event.currentAttendees}/{event.maxAttendees} attending
            </div>
            {event.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{event.rating}</span>
                {event.reviewCount && (
                  <span className="text-xs text-gray-500">({event.reviewCount})</span>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={handleViewDetails}>
            View Details
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden" onClick={handleViewDetails}>
      <div className="relative h-48">
        <ImageWithFallback className="h-48" />
        <div className="absolute top-4 left-4 flex gap-2">
          {event.trending && (
            <Badge className="bg-orange-500 text-white text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              Trending
            </Badge>
          )}
          {event.featured && (
            <Badge className="bg-yellow-500 text-white text-xs">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
        <div className="absolute top-4 right-4">
          <Badge className="bg-black/70 text-white backdrop-blur-sm">
            {formatPrice(event.minPrice || 0, event.maxPrice || 0)}
          </Badge>
        </div>
        <div className="absolute bottom-4 left-4">
          <Badge className="bg-black/70 text-white backdrop-blur-sm">
            {formatDate(event.startDate)}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className={getCategoryColor(event.category)}>
            {getCategoryIcon(event.category)}
            {event.category}
          </Badge>
        </div>

        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.shortDescription || event.description}</p>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {formatTime(event.startTime)} - {formatTime(event.endTime)}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {event.city}, {event.state}
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {event.currentAttendees}/{event.maxAttendees} attending
          </div>
        </div>

        {event.rating && (
          <div className="flex items-center gap-1 mt-3">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{event.rating}</span>
            {event.reviewCount && (
              <span className="text-xs text-gray-500">({event.reviewCount} reviews)</span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={handleViewDetails}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
