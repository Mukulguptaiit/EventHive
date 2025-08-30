"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventCard } from "@/components/EventCard";
import type { Event } from "@/components/EventCard";
import { Search, Filter, MapPin, Calendar, Users } from "lucide-react";

export default function EventsPage() {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get("location") || "");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Build query parameters
        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);
        if (selectedCategory) params.append("category", selectedCategory);
        if (selectedLocation) params.append("location", selectedLocation);

        const response = await fetch(`/api/events?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events || []);
        } else {
          // Fallback to sample data
          setEvents(getSampleEvents());
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        // Fallback to sample data
        setEvents(getSampleEvents());
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [searchQuery, selectedCategory, selectedLocation]);

  const getSampleEvents = (): Event[] => [
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
      title: "Cultural Festival: Unity in Diversity",
      description: "Celebrate India's rich cultural heritage through music, dance, art, and food. Experience the diversity that makes our country unique.",
      shortDescription: "Celebrate cultural diversity",
      category: "FESTIVAL",
      startDate: "2024-10-20",
      endDate: "2024-10-22",
      startTime: "10:00",
      endTime: "22:00",
      location: "India Gate Lawns",
      city: "Delhi",
      state: "Delhi",
      coverImage: "/assets/hero-events.jpg",
      isFree: true,
      minPrice: 0,
      maxPrice: 0,
      currentAttendees: 1200,
      maxAttendees: 5000,
      featured: false,
      trending: false,
      rating: 4.3,
      reviewCount: 78,
    },
  ];

  const eventCategories = [
    { value: "ALL", label: "All Categories" },
    { value: "WORKSHOP", label: "Workshop" },
    { value: "CONCERT", label: "Concert" },
    { value: "SPORTS", label: "Sports" },
    { value: "HACKATHON", label: "Hackathon" },
    { value: "BUSINESS", label: "Business" },
    { value: "CONFERENCE", label: "Conference" },
    { value: "EXHIBITION", label: "Exhibition" },
    { value: "FESTIVAL", label: "Festival" },
    { value: "SEMINAR", label: "Seminar" },
    { value: "WEBINAR", label: "Webinar" },
    { value: "MEETUP", label: "Meetup" },
    { value: "OTHER", label: "Other" },
  ];

  // Note: popular cities quick filter is rendered on the home hero; omit here to avoid unused var.

  const handleSearch = () => {
    // Update URL with search parameters
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (selectedCategory) params.append("category", selectedCategory);
    if (selectedLocation) params.append("location", selectedLocation);
    
    const newUrl = `/events${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.pushState({}, "", newUrl);
  };

  const handleEventClick = (eventId: string) => {
    window.location.href = `/events/${eventId}`;
  };

  const filteredEvents = events.filter(event => {
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !event.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedCategory && event.category !== selectedCategory) {
      return false;
    }
    if (selectedLocation && !event.city.toLowerCase().includes(selectedLocation.toLowerCase()) && 
        !event.state.toLowerCase().includes(selectedLocation.toLowerCase())) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i}>
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Amazing Events</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find events that match your interests and schedule. From workshops to concerts, 
            sports to business events - there's something for everyone.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-lg border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <Select
                value={selectedCategory || "ALL"}
                onValueChange={(v) => setSelectedCategory(v === "ALL" ? "" : v)}
              >
                <SelectTrigger className="h-12 border-orange-200 focus:border-orange-500 focus:ring-orange-500">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {eventCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <div>
              <Button 
                onClick={handleSearch}
                className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-lg"
              >
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Button
              variant="outline"
              size="sm"
              className="border-orange-200 text-orange-700 hover:bg-orange-50"
              onClick={() => {
                setSelectedLocation("Mumbai");
                handleSearch();
              }}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Mumbai
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-orange-200 text-orange-700 hover:bg-orange-50"
              onClick={() => {
                setSelectedCategory("CONCERT");
                handleSearch();
              }}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Concerts
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-orange-200 text-orange-700 hover:bg-orange-50"
              onClick={() => {
                setSelectedCategory("WORKSHOP");
                handleSearch();
              }}
            >
              <Users className="h-4 w-4 mr-2" />
              Workshops
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing {filteredEvents.length} of {events.length} events
          </p>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">Filtered results</span>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                variant="default"
                onViewDetails={handleEventClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or browse all events
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("");
                setSelectedLocation("");
                handleSearch();
              }}
              className="bg-orange-600 hover:bg-orange-700"
            >
              View All Events
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
