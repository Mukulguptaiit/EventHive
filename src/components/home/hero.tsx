"use client";
import { Button } from "@/components/ui/button";

import { MapPin, Search, Calendar, Users, Zap } from "lucide-react";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { useCallback, useEffect, useState } from "react";
import { getPlatformStats } from "@/actions/venue-actions";
import { useRouter } from "next/navigation";

interface PlatformStats {
  events: number;
  attendees: number;
  organizers: number;
}

interface HeroProps {
  location: string;
  setLocation: (location: string) => void;
}

const Hero = ({ location, setLocation }: HeroProps) => {
  const router = useRouter();
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState<PlatformStats>({
    events: 0,
    attendees: 0,
    organizers: 0,
  });

  const handleLocationSearch = useCallback(() => {
    if (!location.trim()) {
      console.warn("Please enter a location");
      alert("Please enter a location to search for events");
      return;
    }
    router.push(`/events?location=${encodeURIComponent(location.trim())}`);
  }, [location, router]);

  const fetchPlatformStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const platformStats = await getPlatformStats();
      setStats(platformStats);
    } catch (error) {
      console.error("Error fetching platform stats:", error);
      setStats({ events: 0, attendees: 0, organizers: 0 });
    } finally {
      setStatsLoading(false);
    }
  }, []);
  useEffect(() => {
    void fetchPlatformStats();
  }, [fetchPlatformStats]);
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="border-emerald-200 bg-emerald-100 px-4 py-2 text-emerald-800">
                <Zap className="mr-2 h-4 w-4" />
                Book Instantly
              </Badge>
              <h1 className="text-4xl leading-tight font-bold text-gray-900 lg:text-6xl">
                DISCOVER &{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  EVENTS
                </span>{" "}
                NEARBY
              </h1>
              <p className="text-xl leading-relaxed text-gray-600">
                Seamlessly explore events and connect with like-minded people
                just like you! Discover, attend, and create unforgettable
                experiences.
              </p>
            </div>

            {/* Location Search */}
            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-xl">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <MapPin className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-emerald-600" />
                  <Input
                    placeholder="Enter your location..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-14 border-emerald-200 pl-12 text-lg focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <Button
                  type="button"
                  className="pointer-events-auto h-14 cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-600 px-8 text-lg font-semibold hover:from-emerald-700 hover:to-teal-700"
                  onClick={handleLocationSearch}
                  disabled={!location.trim()}
                >
                  <Search className="mr-2 h-5 w-5" />
                  Find Events
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">
                  {statsLoading ? "..." : `${stats.events}+`}
                </div>
                <div className="text-gray-600">Events</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">
                  {statsLoading ? "..." : `${stats.attendees}+`}
                </div>
                <div className="text-gray-600">Attendees</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">
                  {statsLoading ? "..." : `${stats.organizers}+`}
                </div>
                <div className="text-gray-600">Organizers</div>
              </div>
            </div>
          </div>

          {/* Right Image - Hidden on mobile */}
          <div className="relative hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 rotate-6 transform rounded-3xl bg-gradient-to-br from-emerald-400/20 to-teal-400/20" />
              <div className="relative -rotate-2 transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-transform duration-500 hover:rotate-0">
                <Image
                  src="/assets/hero-quickcourt.jpg"
                  alt="Event venue"
                  width={600}
                  height={400}
                  className="h-96 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <div className="text-2xl font-bold">
                    Amazing Event Experiences
                  </div>
                  <div className="text-emerald-200">
                    Book your perfect event today
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 animate-bounce rounded-2xl bg-white p-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="h-6 w-6 text-yellow-500" />
                <div>
                  <div className="text-sm font-semibold">Top Rated</div>
                  <div className="text-xs text-gray-500">4.8★ Average</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 rounded-2xl bg-emerald-600 p-4 text-white shadow-lg">
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6" />
                <div>
                  <div className="text-sm font-semibold">Active Now</div>
                  <div className="text-xs text-emerald-200">2.3K+ Attendees</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
