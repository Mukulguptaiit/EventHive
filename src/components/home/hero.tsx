"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Calendar, Users } from "lucide-react";

interface HeroProps {
  onSearch: (query: string, category: string, location: string) => void;
}

export function Hero({ onSearch }: HeroProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");

  const handleSearch = () => {
    onSearch(searchQuery, category, "");
  };

  const eventCategories = [
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

  // popularCities list removed here to avoid unused var; quick filter buttons below cover examples.

  return (
    <section className="relative min-h-[600px] flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Where Events Come{" "}
            <span className="text-orange-600">Alive</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Discover amazing events, connect with like-minded people, and create unforgettable memories. 
            Your next adventure is just a click away.
          </p>

          {/* Search Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-orange-100 max-w-4xl mx-auto">
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

              {/* Category Select */}
              <div>
                <Select value={category} onValueChange={setCategory}>
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
                onClick={() => onSearch("", "", "Mumbai")}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Mumbai
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
                onClick={() => onSearch("", "CONCERT", "")}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Concerts
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
                onClick={() => onSearch("", "WORKSHOP", "")}
              >
                <Users className="h-4 w-4 mr-2" />
                Workshops
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">500+</div>
              <div className="text-gray-600">Events This Month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">10K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">50+</div>
              <div className="text-gray-600">Cities Covered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">95%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-orange-200 rounded-full opacity-20 animate-float"></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-orange-300 rounded-full opacity-20 animate-float-delayed"></div>
    </section>
  );
}