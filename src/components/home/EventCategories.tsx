"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Zap,
  TrendingUp,
  Star,
  Briefcase,
  Presentation,
  Palette,
  Heart,
  BookOpen,
  Video,
  Coffee,
} from "lucide-react";

interface EventCategory {
  name: string;
  icon: React.ComponentType<any>;
  count: number;
  color: string;
  description: string;
  value: string;
}

interface EventCategoriesProps {
  onCategorySelect?: (category: string) => void;
}

export function EventCategories({ onCategorySelect }: EventCategoriesProps) {
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch categories with event counts
        const response = await fetch('/api/events/categories');
        if (response.ok) {
          const data = await response.json();
          const mapped = mapApiCategoriesToView(data.categories || []);
          setCategories(mapped.length ? mapped : getSampleCategories());
        } else {
          // Fallback to sample data
          setCategories(getSampleCategories());
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to sample data
        setCategories(getSampleCategories());
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Map API result [{ category: string, count: number }] to EventCategory view model
  const mapApiCategoriesToView = (
    apiCategories: Array<{ category: string; count: number }>,
  ): EventCategory[] => {
    const meta: Record<string, Pick<EventCategory, "name" | "icon" | "color" | "description" | "value">> = {
      WORKSHOP: {
        name: "Workshop",
        icon: Users,
        color: "bg-blue-500",
        description: "Learn new skills and gain knowledge",
        value: "WORKSHOP",
      },
      CONCERT: {
        name: "Concert",
        icon: Zap,
        color: "bg-purple-500",
        description: "Live music and entertainment",
        value: "CONCERT",
      },
      SPORTS: {
        name: "Sports",
        icon: TrendingUp,
        color: "bg-green-500",
        description: "Athletic competitions and games",
        value: "SPORTS",
      },
      HACKATHON: {
        name: "Hackathon",
        icon: Zap,
        color: "bg-orange-500",
        description: "Coding challenges and innovation",
        value: "HACKATHON",
      },
      BUSINESS: {
        name: "Business",
        icon: Briefcase,
        color: "bg-indigo-500",
        description: "Networking and business events",
        value: "BUSINESS",
      },
      CONFERENCE: {
        name: "Conference",
        icon: Presentation,
        color: "bg-red-500",
        description: "Professional development and learning",
        value: "CONFERENCE",
      },
      EXHIBITION: {
        name: "Exhibition",
        icon: Palette,
        color: "bg-yellow-500",
        description: "Art and creative showcases",
        value: "EXHIBITION",
      },
      FESTIVAL: {
        name: "Festival",
        icon: Heart,
        color: "bg-pink-500",
        description: "Cultural celebrations and fun",
        value: "FESTIVAL",
      },
      SEMINAR: {
        name: "Seminar",
        icon: BookOpen,
        color: "bg-teal-500",
        description: "Educational sessions and talks",
        value: "SEMINAR",
      },
      WEBINAR: {
        name: "Webinar",
        icon: Video,
        color: "bg-cyan-500",
        description: "Online learning and discussions",
        value: "WEBINAR",
      },
      MEETUP: {
        name: "Meetup",
        icon: Coffee,
        color: "bg-gray-500",
        description: "Casual networking and socializing",
        value: "MEETUP",
      },
      OTHER: {
        name: "Other",
        icon: Star,
        color: "bg-gray-400",
        description: "Miscellaneous events",
        value: "OTHER",
      },
    };

    // Build with fallback icon/info for any unknown enum values and dedupe by value
    const map = new Map<string, EventCategory>();
    for (const { category, count } of apiCategories) {
      const key = String(category).toUpperCase();
      const base = meta[key] ?? {
        name: key.charAt(0) + key.slice(1).toLowerCase(),
        icon: Users,
        color: "bg-gray-400",
        description: "Browse events in this category",
        value: key,
      };
      const existing = map.get(base.value);
      map.set(base.value, {
        ...base,
        count: (existing?.count ?? 0) + count,
      });
    }
    return Array.from(map.values());
  };

  const getSampleCategories = (): EventCategory[] => [
    {
      name: "Workshop",
      icon: Users,
      count: 45,
      color: "bg-blue-500",
      description: "Learn new skills and gain knowledge",
      value: "WORKSHOP"
    },
    {
      name: "Concert",
      icon: Zap,
      count: 32,
      color: "bg-purple-500",
      description: "Live music and entertainment",
      value: "CONCERT"
    },
    {
      name: "Sports",
      icon: TrendingUp,
      count: 28,
      color: "bg-green-500",
      description: "Athletic competitions and games",
      value: "SPORTS"
    },
    {
      name: "Hackathon",
      icon: Zap,
      count: 15,
      color: "bg-orange-500",
      description: "Coding challenges and innovation",
      value: "HACKATHON"
    },
    {
      name: "Business",
      icon: Briefcase,
      count: 38,
      color: "bg-indigo-500",
      description: "Networking and business events",
      value: "BUSINESS"
    },
    {
      name: "Conference",
      icon: Presentation,
      count: 25,
      color: "bg-red-500",
      description: "Professional development and learning",
      value: "CONFERENCE"
    },
    {
      name: "Exhibition",
      icon: Palette,
      count: 18,
      color: "bg-yellow-500",
      description: "Art and creative showcases",
      value: "EXHIBITION"
    },
    {
      name: "Festival",
      icon: Heart,
      count: 22,
      color: "bg-pink-500",
      description: "Cultural celebrations and fun",
      value: "FESTIVAL"
    },
    {
      name: "Seminar",
      icon: BookOpen,
      count: 31,
      color: "bg-teal-500",
      description: "Educational sessions and talks",
      value: "SEMINAR"
    },
    {
      name: "Webinar",
      icon: Video,
      count: 42,
      color: "bg-cyan-500",
      description: "Online learning and discussions",
      value: "WEBINAR"
    },
    {
      name: "Meetup",
      icon: Coffee,
      count: 35,
      color: "bg-gray-500",
      description: "Casual networking and socializing",
      value: "MEETUP"
    },
    {
      name: "Other",
      icon: Star,
      count: 12,
      color: "bg-gray-400",
      description: "Miscellaneous events",
      value: "OTHER"
    }
  ];

  const handleCategoryClick = (category: string) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover events that match your interests. From workshops to concerts, 
            sports to business events - find exactly what you're looking for.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <Card
              key={category.value}
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-orange-200"
              onClick={() => handleCategoryClick(category.value)}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <category.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors duration-300">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {category.description}
                </p>
                <div className="text-xs text-gray-500">
                  {category.count} events
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            className="border-orange-200 text-orange-700 hover:bg-orange-50"
            onClick={() => onCategorySelect && onCategorySelect("")}
          >
            View All Categories
          </Button>
        </div>
      </div>
    </section>
  );
}
