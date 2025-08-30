"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EventCard, type Event } from "@/components/EventCard";
import { ArrowRight, Star, TrendingUp } from "lucide-react";

interface EventsSectionProps {
  onViewAllEvents?: () => void;
  onEventClick?: (eventId: string) => void;
}

export function EventsSection({ onViewAllEvents, onEventClick }: EventsSectionProps) {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [trendingEvents, setTrendingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Fetch featured events
        const featuredResponse = await fetch('/api/events?featured=true&limit=3');
        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json();
          setFeaturedEvents(featuredData.events || []);
        }

        // Fetch trending events
        const trendingResponse = await fetch('/api/events?trending=true&limit=3');
        if (trendingResponse.ok) {
          const trendingData = await trendingResponse.json();
          setTrendingEvents(trendingData.events || []);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        // Fallback to sample data if API fails
        setFeaturedEvents(getSampleFeaturedEvents());
        setTrendingEvents(getSampleTrendingEvents());
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getSampleFeaturedEvents = (): Event[] => [
    {
      id: "1",
      title: "Summer Music Festival 2024",
      description: "Join us for the biggest music festival of the year featuring top artists and DJs from around the world. Experience electrifying performances, amazing food, and unforgettable memories.",
      shortDescription: "The biggest music festival of the year",
      category: "CONCERT",
      startDate: "2024-09-15",
      endDate: "2024-09-15",
      startTime: "18:00",
      endTime: "23:00",
      location: "Bandra Kurla Complex",
      city: "Mumbai",
      state: "Maharashtra",
  coverImage: "/assets/concert.jpg",
      isFree: false,
      minPrice: 1500,
      maxPrice: 5000,
      currentAttendees: 1200,
      maxAttendees: 5000,
      featured: true,
      trending: true,
      rating: 4.8,
      reviewCount: 156,
    },
    {
      id: "2",
      title: "Tech Workshop: AI & Machine Learning",
      description: "Learn the fundamentals of AI and ML from industry experts. Hands-on sessions, real-world projects, and networking opportunities with tech professionals.",
      shortDescription: "Master AI & ML fundamentals",
      category: "WORKSHOP",
      startDate: "2024-09-20",
      endDate: "2024-09-22",
      startTime: "10:00",
      endTime: "18:00",
      location: "Tech Hub Bangalore",
      city: "Bangalore",
      state: "Karnataka",
  coverImage: "/assets/hero-quickcourt.jpg",
      isFree: false,
      minPrice: 500,
      maxPrice: 2000,
      currentAttendees: 85,
      maxAttendees: 100,
      featured: true,
      trending: true,
      rating: 4.6,
      reviewCount: 89,
    },
    {
      id: "3",
      title: "Basketball Championship 2024",
      description: "Inter-college basketball tournament with exciting prizes. Show your skills, compete with the best, and win amazing rewards.",
      shortDescription: "Inter-college basketball tournament",
      category: "SPORTS",
      startDate: "2024-09-25",
      endDate: "2024-09-27",
      startTime: "16:00",
      endTime: "21:00",
      location: "JLN Stadium",
      city: "Delhi",
      state: "Delhi",
  coverImage: "/assets/football.jpg",
      isFree: true,
      minPrice: 0,
      maxPrice: 0,
      currentAttendees: 300,
      maxAttendees: 1000,
      featured: true,
      trending: false,
      rating: 4.4,
      reviewCount: 67,
    },
  ];

  const getSampleTrendingEvents = (): Event[] => [
    {
      id: "4",
      title: "Startup Pitch Competition",
      description: "Pitch your innovative startup idea to investors and industry experts. Get feedback, network, and potentially secure funding.",
      shortDescription: "Pitch your startup to investors",
      category: "BUSINESS",
      startDate: "2024-10-05",
      endDate: "2024-10-05",
      startTime: "14:00",
      endTime: "20:00",
      location: "Wework BKC",
      city: "Mumbai",
      state: "Maharashtra",
  coverImage: "/assets/tennis.jpg",
      isFree: false,
      minPrice: 1000,
      maxPrice: 1000,
      currentAttendees: 150,
      maxAttendees: 200,
      featured: false,
      trending: true,
      rating: 4.7,
      reviewCount: 92,
    },
    {
      id: "5",
      title: "Hackathon: Build the Future",
      description: "24-hour coding challenge to build innovative solutions. Work with talented developers, learn new technologies, and win exciting prizes.",
      shortDescription: "24-hour coding challenge",
      category: "HACKATHON",
      startDate: "2024-10-15",
      endDate: "2024-10-16",
      startTime: "09:00",
      endTime: "09:00",
      location: "IIIT Bangalore",
      city: "Bangalore",
      state: "Karnataka",
  coverImage: "/assets/badminton.jpg",
      isFree: false,
      minPrice: 500,
      maxPrice: 500,
      currentAttendees: 250,
      maxAttendees: 300,
      featured: true,
      trending: true,
      rating: 4.9,
      reviewCount: 134,
    },
    {
      id: "6",
      title: "Wellness Retreat: Mind & Body",
      description: "Escape the city and rejuvenate your mind and body. Yoga, meditation, spa treatments, and healthy food in a peaceful environment.",
      shortDescription: "Rejuvenate mind and body",
      category: "WORKSHOP",
      startDate: "2024-11-01",
      endDate: "2024-11-03",
      startTime: "08:00",
      endTime: "20:00",
      location: "Ananda Spa Resort",
      city: "Rishikesh",
      state: "Uttarakhand",
  coverImage: "/assets/tennis.jpg",
      isFree: false,
      minPrice: 15000,
      maxPrice: 25000,
      currentAttendees: 35,
      maxAttendees: 50,
      featured: false,
      trending: true,
      rating: 4.5,
      reviewCount: 78,
    },
  ];

  const handleEventClick = (eventId: string) => {
    if (onEventClick) {
      onEventClick(eventId);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Featured Events */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Featured Events</h2>
                <p className="text-gray-600">Don't miss these amazing events happening soon</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-orange-200 text-orange-700 hover:bg-orange-50"
              onClick={onViewAllEvents}
            >
              Explore All Events
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                variant="featured"
                onViewDetails={handleEventClick}
              />
            ))}
          </div>
        </div>

        {/* Trending Events */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Trending Now</h2>
                <p className="text-gray-600">Events that are gaining popularity</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-orange-200 text-orange-700 hover:bg-orange-50"
              onClick={onViewAllEvents}
            >
              View All Trending
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trendingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                variant="default"
                onViewDetails={handleEventClick}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
