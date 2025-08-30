import {
  Wifi,
  Car,
  Coffee,
  ShowerHead,
  AirVent,
  Camera,
  Shield,
  Users,
  Zap,
  CheckCircle,
} from "lucide-react";

// Amenity configuration with icons and display information
export interface AmenityConfig {
  name: string;
  icon: any;
  category: "comfort" | "facilities" | "services" | "safety";
  description?: string;
}

// Map of amenity names to their configurations
export const AMENITY_CONFIGS: Record<string, AmenityConfig> = {
  WiFi: {
    name: "WiFi",
    icon: Wifi,
    category: "comfort",
    description: "Free wireless internet access",
  },
  Parking: {
    name: "Parking",
    icon: Car,
    category: "facilities",
    description: "On-site parking available",
  },
  Cafeteria: {
    name: "Cafeteria",
    icon: Coffee,
    category: "services",
    description: "Food and beverages available",
  },
  "Changing Room": {
    name: "Changing Room",
    icon: ShowerHead,
    category: "facilities",
    description: "Private changing facilities",
  },
  "Air Conditioning": {
    name: "Air Conditioning",
    icon: AirVent,
    category: "comfort",
    description: "Climate controlled environment",
  },
  AC: {
    name: "Air Conditioning",
    icon: AirVent,
    category: "comfort",
    description: "Climate controlled environment",
  },
  CCTV: {
    name: "CCTV",
    icon: Camera,
    category: "safety",
    description: "24/7 security monitoring",
  },
  Security: {
    name: "Security",
    icon: Shield,
    category: "safety",
    description: "Professional security services",
  },
  "Equipment Rental": {
    name: "Equipment Rental",
    icon: Users,
    category: "services",
    description: "Sports equipment available for rent",
  },
  "Pro Shop": {
    name: "Pro Shop",
    icon: Users,
    category: "services",
    description: "Professional equipment and accessories",
  },
  Coaching: {
    name: "Coaching",
    icon: Users,
    category: "services",
    description: "Professional coaching services",
  },
  Floodlights: {
    name: "Floodlights",
    icon: Zap,
    category: "facilities",
    description: "Night play lighting available",
  },
  "Water Cooler": {
    name: "Water Cooler",
    icon: Coffee,
    category: "comfort",
    description: "Fresh drinking water available",
  },
  Pavilion: {
    name: "Pavilion",
    icon: Users,
    category: "facilities",
    description: "Covered seating area",
  },
  Scoreboard: {
    name: "Scoreboard",
    icon: Users,
    category: "facilities",
    description: "Electronic scoreboard available",
  },
};

// Transform amenities from database to UI format
export interface TransformedAmenity {
  name: string;
  icon: any;
  available: boolean;
  category: string;
  description?: string;
}

/**
 * Transform amenities array to match UI expectations with availability status
 */
export function transformAmenities(amenities: string[]): TransformedAmenity[] {
  return amenities.map((amenity) => {
    const config = AMENITY_CONFIGS[amenity];

    if (config) {
      return {
        name: config.name,
        icon: config.icon,
        available: true, // All amenities in the array are considered available
        category: config.category,
        description: config.description,
      };
    }

    // Fallback for unknown amenities
    return {
      name: amenity,
      icon: CheckCircle,
      available: true,
      category: "facilities",
      description: undefined,
    };
  });
}

/**
 * Get amenities grouped by category
 */
export function groupAmenitiesByCategory(
  amenities: TransformedAmenity[],
): Record<string, TransformedAmenity[]> {
  return amenities.reduce(
    (groups, amenity) => {
      const category = amenity.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(amenity);
      return groups;
    },
    {} as Record<string, TransformedAmenity[]>,
  );
}

/**
 * Get available amenity names for filtering
 */
export function getAvailableAmenityNames(): string[] {
  return Object.keys(AMENITY_CONFIGS);
}

/**
 * Check if a venue has a specific amenity
 */
export function hasAmenity(amenities: string[], amenityName: string): boolean {
  return amenities.some(
    (amenity) =>
      amenity === amenityName || AMENITY_CONFIGS[amenity]?.name === amenityName,
  );
}

/**
 * Get amenity icon by name
 */
export function getAmenityIcon(amenityName: string): any {
  const config = AMENITY_CONFIGS[amenityName];
  return config ? config.icon : CheckCircle;
}

/**
 * Filter amenities by category
 */
export function filterAmenitiesByCategory(
  amenities: TransformedAmenity[],
  category: string,
): TransformedAmenity[] {
  return amenities.filter((amenity) => amenity.category === category);
}

/**
 * Get amenity categories
 */
export function getAmenityCategories(): string[] {
  return ["comfort", "facilities", "services", "safety"];
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: string): string {
  const categoryNames: Record<string, string> = {
    comfort: "Comfort & Convenience",
    facilities: "Facilities",
    services: "Services",
    safety: "Safety & Security",
  };

  return categoryNames[category] || category;
}
