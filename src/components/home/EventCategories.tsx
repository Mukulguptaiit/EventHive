"use client";
import { getEventCategories } from "@/actions/venue-actions";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Card } from "../ui/card";

interface EventCategory {
  name: string;
  image: string;
  events: number;
}

// Event category image mapping
const EVENT_IMAGE_MAP: Record<string, string> = {
  Workshop: "/assets/sports/tennis.jpg", // Placeholder
  Concert: "/assets/sports/badminton.jpg", // Placeholder
  Sports: "/assets/sports/football.jpg",
  Hackathon: "/assets/sports/basketball.jpg", // Placeholder
  Conference: "/assets/sports/cricket.jpg", // Placeholder
  Seminar: "/assets/sports/swimming.jpg", // Placeholder
  Webinar: "/assets/sports/tabletennis.jpg", // Placeholder
  Meetup: "/assets/sports/volleyball.jpg", // Placeholder
  Festival: "/assets/sports/squash.jpg", // Placeholder
  Exhibition: "/assets/sports/tennis.jpg", // Placeholder
};

// Function to get event image with fallback
const getEventImage = (eventName: string, originalImage?: string): string => {
  // If there's an original image and it's not placeholder, use it
  if (originalImage && !originalImage.includes("placeholder")) {
    return originalImage;
  }

  // Try to find exact match in the map
  const exactMatch = EVENT_IMAGE_MAP[eventName];
  if (exactMatch) {
    return exactMatch;
  }

  // Try to find partial match (case insensitive)
  const partialMatch = Object.keys(EVENT_IMAGE_MAP).find(
    (key) =>
      key.toLowerCase().includes(eventName.toLowerCase()) ||
      eventName.toLowerCase().includes(key.toLowerCase()),
  );

  if (partialMatch) {
    return EVENT_IMAGE_MAP[partialMatch];
  }

  // Default fallback
  return "/assets/sports/badminton.jpg";
};

const EventCategories = () => {
  const [eventCategories, setEventCategories] = useState<EventCategory[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  
  const fetchEventCategories = async () => {
    setEventsLoading(true);
    try {
      const categories = await getEventCategories();
      const formattedCategories = categories.map((cat) => ({
        name: cat.name,
        image: cat.image,
        events: cat.events,
      }));
      setEventCategories(formattedCategories);
    } catch (error) {
      console.error("Error fetching event categories:", error);
      setEventCategories([]);
    } finally {
      setEventsLoading(false);
    }
  };
  
  useEffect(() => {
    void fetchEventCategories();
  }, []);
  
  return (
    <section className="bg-gradient-to-br from-gray-50 to-emerald-50 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
            Popular Event Types
          </h2>
          <p className="text-lg text-gray-600">
            Choose your favorite event type and discover amazing experiences
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
          {eventsLoading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <Card
                key={index}
                className="animate-pulse overflow-hidden border-0"
              >
                <div className="h-32 bg-gray-200" />
              </Card>
            ))
          ) : eventCategories.length === 0 ? (
            // Empty state
            <div className="col-span-full py-12 text-center">
              <div className="text-gray-500">
                No event categories available
              </div>
            </div>
          ) : (
            eventCategories.map((event) => (
              <Card
                key={event.name}
                className="group cursor-pointer overflow-hidden border-0 transition-all duration-300 hover:shadow-xl"
              >
                <div className={`relative h-32`}>
                  <Image
                    src={getEventImage(event.name, event.image)}
                    alt={event.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/20" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <div className="text-lg font-bold drop-shadow-lg">
                      {event.name}
                    </div>
                    <div className="text-xs opacity-90 drop-shadow-md">
                      {event.events} events
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default EventCategories;
