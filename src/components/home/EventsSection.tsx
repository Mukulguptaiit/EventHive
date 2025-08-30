"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Star, Users } from "lucide-react";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { useState } from "react";

interface EventsProps {
  location: string;
}

// Temporary mock data for events
const mockEvents = [
  {
    id: "1",
    title: "React & Next.js Workshop",
    description: "Learn the fundamentals of React and Next.js",
    startDate: "2025-09-15",
    startTime: "09:00",
    location: "TechHub San Francisco",
    eventType: "WORKSHOP",
    images: ["/assets/hero-quickcourt.jpg"],
    maxAttendees: 50,
    registeredCount: 32,
    price: 99,
    rating: 4.8,
    organizerName: "Alice Johnson",
  },
  {
    id: "2", 
    title: "Summer Music Festival 2025",
    description: "Amazing day of live music featuring local artists",
    startDate: "2025-07-20",
    startTime: "12:00",
    location: "Golden Gate Park",
    eventType: "CONCERT",
    images: ["/assets/hero-quickcourt.jpg"],
    maxAttendees: 5000,
    registeredCount: 3247,
    price: 75,
    rating: 4.9,
    organizerName: "Carol Williams",
  },
  {
    id: "3",
    title: "AI/ML Hackathon 2025", 
    description: "48-hour hackathon focused on AI and ML solutions",
    startDate: "2025-10-05",
    startTime: "18:00",
    location: "Innovation Center Seattle",
    eventType: "HACKATHON",
    images: ["/assets/hero-quickcourt.jpg"],
    maxAttendees: 200,
    registeredCount: 156,
    price: 25,
    rating: 4.7,
    organizerName: "Bob Smith",
  },
];

const EventCard = ({ event }: { event: any }) => (
  <Card className="group overflow-hidden border-emerald-100 transition-all duration-300 hover:shadow-xl">
    <div className="relative">
      <Image
        src={event.images[0] || "/assets/hero-quickcourt.jpg"}
        alt={event.title}
        width={300}
        height={200}
        className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute top-3 right-3">
        <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800">
          {event.eventType}
        </Badge>
      </div>
      <div className="absolute top-3 left-3">
        <Badge className="border-blue-200 bg-blue-100 text-blue-800">
          ${event.price}
        </Badge>
      </div>
    </div>

    <CardContent className="p-4">
      <div className="mb-2 flex items-start justify-between">
        <h3 className="text-lg font-semibold transition-colors group-hover:text-emerald-600">
          {event.title}
        </h3>
        <div className="flex items-center space-x-1 text-sm">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{event.rating}</span>
        </div>
      </div>

      <p className="mb-3 text-sm text-gray-600 line-clamp-2">
        {event.description}
      </p>

      <div className="mb-3 space-y-1">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="mr-2 h-4 w-4" />
          {new Date(event.startDate).toLocaleDateString()} at {event.startTime}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="mr-2 h-4 w-4" />
          {event.location}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Users className="mr-2 h-4 w-4" />
          {event.registeredCount}/{event.maxAttendees} registered
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">by {event.organizerName}</span>
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
          Register Now
        </Button>
      </div>
    </CardContent>
  </Card>
);

const EventsSection = ({ location }: EventsProps) => {
  const [events] = useState(mockEvents);
  const [loading] = useState(false);

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="mb-2 text-3xl font-bold text-gray-900 lg:text-4xl">
              Trending Events in {location}
            </h2>
            <p className="text-lg text-gray-600">
              Discover amazing events happening near you
            </p>
          </div>
          <Button variant="outline" className="hidden sm:flex">
            View All Events
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="h-48 bg-gray-200" />
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-3 bg-gray-200 rounded mb-4" />
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded" />
                    <div className="h-3 bg-gray-200 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="text-gray-500">
              No events found in {location}. Try searching in a different area.
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Button variant="outline" className="sm:hidden">
            View All Events
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
