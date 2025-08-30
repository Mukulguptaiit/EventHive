"use client";

import { Hero } from "./hero";
import { EventCategories } from "./EventCategories";
import { EventsSection } from "./EventsSection";
import { CallToAction } from "./CallToAction";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function Home() {
  const router = useRouter();
  // Local search state is not used directly on the Home page; values are forwarded to /events via router.

  const handleSearch = (query: string, category: string, location: string) => {
    // Navigate to events page with search parameters
    const params = new URLSearchParams();
    if (query) params.append("search", query);
    if (category) params.append("category", category);
    if (location) params.append("location", location);
    
    const searchString = params.toString();
    router.push(`/events${searchString ? `?${searchString}` : ""}`);
  };

  const handleCategorySelect = (category: string) => {
    if (category) {
      router.push(`/events?category=${category}`);
    } else {
      router.push("/events");
    }
  };

  const handleViewAllEvents = () => {
    router.push("/events");
  };

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const handleCreateEvent = async () => {
    const { data: session } = await authClient.getSession();
    if (!session?.user) {
      router.push("/auth/login?redirect=/dashboard/create-event");
      return;
    }
    router.push("/dashboard/create-event");
  };

  return (
    <div className="min-h-screen">
      <Hero onSearch={handleSearch} />
      <EventCategories onCategorySelect={handleCategorySelect} />
      <EventsSection 
        onViewAllEvents={handleViewAllEvents}
        onEventClick={handleEventClick}
      />
      <CallToAction onCreateEvent={handleCreateEvent} />
    </div>
  );
}
