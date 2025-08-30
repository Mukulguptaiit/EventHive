import type { VenueType } from "@/types/venue";
import type {
  VenueType as PrismaVenueType,
  SportType as PrismaSportType,
} from "@/generated/prisma";

// Types for the transformed venue data that matches UI expectations
export interface VenueListItem {
  id: string;
  name: string;
  image: string;
  sports: string[];
  price: number;
  location: string;
  rating: number;
  reviews: number;
  type: "Indoor" | "Outdoor" | "Mixed";
  amenities: string[];
  availability: string;
}

export interface VenueDetails {
  id: string;
  name: string;
  location: string;
  fullAddress: string;
  rating: number;
  reviews: number;
  price: number;
  operatingHours: string;
  phone?: string;
  email?: string;
  images: string[];
  sports: Array<{
    name: string;
    icon: string;
    courts: number;
  }>;
  amenities: Array<{
    name: string;
    iconName: string;
    available: boolean;
  }>;
  policies: string[];
  timeSlots: Array<{
    time: string;
    price: number;
    available: boolean;
  }>;
}

export interface TimeSlot {
  time: string;
  price: number;
  available: boolean;
  courtId: string;
  timeSlotId: string;
}

// Database types with relations (these would come from Prisma queries)
export interface FacilityWithCourts {
  id: string;
  name: string;
  description: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  amenities: string[];
  photos: string[];
  phone: string | null;
  email: string | null;
  policies: string[];
  venueType: PrismaVenueType;
  rating: number | null;
  reviewCount: number;
  courts: Array<{
    id: string;
    name: string;
    sportType: PrismaSportType;
    pricePerHour: number;
    operatingStartHour: number;
    operatingEndHour: number;
    isActive: boolean;
  }>;
  reviews?: Array<{
    rating: number;
  }>;
}

export interface FacilityWithDetails extends FacilityWithCourts {
  courts: Array<{
    id: string;
    name: string;
    sportType: PrismaSportType;
    pricePerHour: number;
    operatingStartHour: number;
    operatingEndHour: number;
    isActive: boolean;
    timeSlots: Array<{
      id: string;
      startTime: Date;
      endTime: Date;
      isMaintenanceBlocked: boolean;
      maintenanceReason: string | null;
      booking?: {
        id: string;
        status: string;
      } | null;
    }>;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    verified: boolean;
    createdAt: Date;
    player: {
      user: {
        name: string;
      };
    };
  }>;
}

// Sport type mappings
const SPORT_ICONS: Record<PrismaSportType, string> = {
  BADMINTON: "🏸",
  TENNIS: "🎾",
  SQUASH: "🎾",
  BASKETBALL: "🏀",
  FOOTBALL: "⚽",
  CRICKET: "🏏",
  TABLE_TENNIS: "🏓",
  VOLLEYBALL: "🏐",
};

const SPORT_NAMES: Record<PrismaSportType, string> = {
  BADMINTON: "Badminton",
  TENNIS: "Tennis",
  SQUASH: "Squash",
  BASKETBALL: "Basketball",
  FOOTBALL: "Football",
  CRICKET: "Cricket",
  TABLE_TENNIS: "Table Tennis",
  VOLLEYBALL: "Volleyball",
};

// Venue type mappings
const VENUE_TYPE_MAPPING: Record<
  PrismaVenueType,
  "Indoor" | "Outdoor" | "Mixed"
> = {
  INDOOR: "Indoor",
  OUTDOOR: "Outdoor",
  MIXED: "Mixed",
};

/**
 * Transform a facility with courts to a venue list item for the venues page
 */
export function transformFacilityToVenueListItem(
  facility: FacilityWithCourts,
): VenueListItem {
  const activeCourts = facility.courts.filter((court) => court.isActive);

  // Get unique sports from active courts
  const uniqueSports = Array.from(
    new Set(activeCourts.map((court) => SPORT_NAMES[court.sportType])),
  );

  // Calculate minimum price from active courts
  const minPrice =
    activeCourts.length > 0
      ? Math.min(...activeCourts.map((court) => court.pricePerHour))
      : 0;

  // Calculate availability status
  const availability = calculateAvailabilityStatus(activeCourts.length);

  // Use first photo or fallback
  const image =
    facility.photos.length > 0
      ? facility.photos[0]
      : "/assets/default-venue.png";

  return {
    id: facility.id,
    name: facility.name,
    image: image ?? "",
    sports: uniqueSports,
    price: minPrice,
    location: facility.address,
    rating: facility.rating ?? 0,
    reviews: facility.reviewCount,
    type: VENUE_TYPE_MAPPING[facility.venueType],
    amenities: facility.amenities,
    availability,
  };
}

/**
 * Transform a facility with detailed information to venue details for the venue details page
 */
export function transformFacilityToVenueDetails(
  facility: FacilityWithDetails,
): VenueDetails {
  const activeCourts = facility.courts.filter((court) => court.isActive);

  // Aggregate sports data
  const sportsData = aggregateCourtData(activeCourts);

  // Calculate minimum price
  const minPrice =
    activeCourts.length > 0
      ? Math.min(...activeCourts.map((court) => court.pricePerHour))
      : 0;

  // Calculate operating hours
  const operatingHours = calculateOperatingHours(activeCourts);

  // Transform amenities to match UI expectations
  const amenities = transformAmenities(facility.amenities);

  return {
    id: facility.id,
    name: facility.name,
    location: facility.address,
    fullAddress: facility.address,
    rating: facility.rating ?? 0,
    reviews: facility.reviewCount,
    price: minPrice,
    operatingHours,
    phone: facility.phone ?? "",
    email: facility.email ?? "",
    images:
      facility.photos.length > 0
        ? facility.photos
        : ["/assets/default-venue.png"],
    sports: sportsData,
    amenities,
    policies: facility.policies,
    timeSlots: [], // This will be populated separately when needed
  };
}

/**
 * Aggregate court data to get sports summary with court counts
 */
export function aggregateCourtData(
  courts: Array<{
    sportType: PrismaSportType;
    isActive: boolean;
  }>,
): Array<{ name: string; icon: string; courts: number }> {
  const activeCourts = courts.filter((court) => court.isActive);

  // Group courts by sport type
  const sportGroups = activeCourts.reduce(
    (acc, court) => {
      const sportName = SPORT_NAMES[court.sportType];
      acc[sportName] ??= {
        name: sportName,
        icon: SPORT_ICONS[court.sportType],
        courts: 0,
      };
      acc[sportName].courts++;
      return acc;
    },
    {} as Record<string, { name: string; icon: string; courts: number }>,
  );

  return Object.values(sportGroups);
}

/**
 * Calculate operating hours from court schedules
 */
export function calculateOperatingHours(
  courts: Array<{
    operatingStartHour: number;
    operatingEndHour: number;
    isActive: boolean;
  }>,
): string {
  const activeCourts = courts.filter((court) => court.isActive);

  if (activeCourts.length === 0) {
    return "Hours not available";
  }

  // Find the earliest start time and latest end time
  const earliestStart = Math.min(
    ...activeCourts.map((court) => court.operatingStartHour),
  );
  const latestEnd = Math.max(
    ...activeCourts.map((court) => court.operatingEndHour),
  );

  // Format hours (24-hour to 12-hour format)
  const formatHour = (hour: number): string => {
    if (hour === 0) return "12:00 AM";
    if (hour === 12) return "12:00 PM";
    if (hour < 12) return `${hour}:00 AM`;
    return `${hour - 12}:00 PM`;
  };

  return `${formatHour(earliestStart)} - ${formatHour(latestEnd)}`;
}

/**
 * Transform time slots for a specific date and court
 */
export function transformTimeSlots(
  courts: Array<{
    id: string;
    pricePerHour: number;
    operatingStartHour: number;
    operatingEndHour: number;
    timeSlots: Array<{
      id: string;
      startTime: Date;
      endTime: Date;
      price: number | null;
      isMaintenanceBlocked: boolean;
      bookings?: Array<{
        id: string;
        status: string;
      }>;
    }>;
  }>,
  selectedDate: Date,
): TimeSlot[] {
  const timeSlots: TimeSlot[] = [];
  const now = new Date();
  const isToday = selectedDate.toDateString() === now.toDateString();

  for (const court of courts) {
    for (const slot of court.timeSlots) {
      // Check if slot is for the selected date
      const slotDate = new Date(slot.startTime);
      if (slotDate.toDateString() !== selectedDate.toDateString()) {
        continue;
      }

      // Skip past time slots for today
      if (isToday && slot.startTime <= now) {
        continue;
      }

      // Determine availability - check if there are any confirmed bookings
      const isBooked =
        slot.bookings?.some((booking) => booking.status === "CONFIRMED") ??
        false;
      const isBlocked = slot.isMaintenanceBlocked;
      const available = !isBooked && !isBlocked;

      // Format time
      const startTime = slotDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const endTime = new Date(slot.endTime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      timeSlots.push({
        time: `${startTime} - ${endTime}`,
        price: slot.price ?? court.pricePerHour,
        available,
        courtId: court.id,
        timeSlotId: slot.id,
      });
    }
  }

  // Sort by start time
  return timeSlots.sort((a, b) => {
    const timeA = new Date(`1970/01/01 ${a.time.split(" - ")[0]}`);
    const timeB = new Date(`1970/01/01 ${b.time.split(" - ")[0]}`);
    return timeA.getTime() - timeB.getTime();
  });
}

/**
 * Check if a specific time slot is available
 */
export function checkSlotAvailability(timeSlot: {
  isMaintenanceBlocked: boolean;
  bookings?: Array<{
    status: string;
  }>;
}): boolean {
  const isBooked =
    timeSlot.bookings?.some((booking) => booking.status === "CONFIRMED") ??
    false;
  const isBlocked = timeSlot.isMaintenanceBlocked;
  return !isBooked && !isBlocked;
}

/**
 * Calculate availability status for venue list
 */
function calculateAvailabilityStatus(courtCount: number): string {
  if (courtCount === 0) {
    return "Not Available";
  }

  // This is a simplified calculation - in a real app, you'd check actual availability
  // For now, we'll use court count as a proxy
  if (courtCount >= 4) {
    return "Available Now";
  } else if (courtCount >= 2) {
    return `${courtCount} slots left`;
  } else {
    return "Limited availability";
  }
}

/**
 * Transform amenities array to match UI expectations with availability status
 * Returns icon names instead of React components to avoid serialization issues
 */
function transformAmenities(amenities: string[]): Array<{
  name: string;
  iconName: string;
  available: boolean;
}> {
  return amenities.map((amenity) => {
    // Map amenity names to icon names for client-side resolution
    const iconMapping: Record<string, string> = {
      WiFi: "Wifi",
      Parking: "Car",
      Cafeteria: "Coffee",
      "Changing Room": "ShowerHead",
      "Air Conditioning": "AirVent",
      AC: "AirVent",
      CCTV: "Camera",
      Security: "Shield",
      "Equipment Rental": "Users",
      "Pro Shop": "Users",
      Coaching: "Users",
      Floodlights: "Zap",
      "Water Cooler": "Coffee",
      Pavilion: "Users",
      Scoreboard: "Users",
    };

    return {
      name: amenity,
      iconName: iconMapping[amenity] ?? "CheckCircle",
      available: true,
    };
  });
}

/**
 * Generate time slots for a court on a specific date
 * This is used when time slots don't exist in the database yet
 */
export function generateTimeSlots(
  court: {
    id: string;
    pricePerHour: number;
    operatingStartHour: number;
    operatingEndHour: number;
  },
  date: Date,
): TimeSlot[] {
  const timeSlots: TimeSlot[] = [];

  for (
    let hour = court.operatingStartHour;
    hour < court.operatingEndHour;
    hour++
  ) {
    const startTime = new Date(date);
    startTime.setHours(hour, 0, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(hour + 1, 0, 0, 0);

    const startTimeStr = startTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const endTimeStr = endTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    timeSlots.push({
      time: `${startTimeStr} - ${endTimeStr}`,
      price: court.pricePerHour,
      available: true, // Default to available for generated slots
      courtId: court.id,
      timeSlotId: `generated-${court.id}-${hour}`, // Temporary ID for generated slots
    });
  }

  return timeSlots;
}

/**
 * Calculate pricing summary for a venue
 */
export interface PricingSummary {
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  priceRange: string;
}

export function calculatePricingSummary(
  courts: Array<{
    pricePerHour: number;
    isActive: boolean;
  }>,
): PricingSummary {
  const activeCourts = courts.filter((court) => court.isActive);

  if (activeCourts.length === 0) {
    return {
      minPrice: 0,
      maxPrice: 0,
      averagePrice: 0,
      priceRange: "Price not available",
    };
  }

  const prices = activeCourts.map((court) => court.pricePerHour);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const averagePrice =
    prices.reduce((sum, price) => sum + price, 0) / prices.length;

  const priceRange =
    minPrice === maxPrice
      ? `₹${minPrice}/hour`
      : `₹${minPrice} - ₹${maxPrice}/hour`;

  return {
    minPrice,
    maxPrice,
    averagePrice: Math.round(averagePrice),
    priceRange,
  };
}

/**
 * Calculate venue availability for a specific date
 */
export interface AvailabilityInfo {
  totalSlots: number;
  availableSlots: number;
  bookedSlots: number;
  maintenanceSlots: number;
  availabilityPercentage: number;
  status: string;
}

export function calculateVenueAvailability(
  courts: Array<{
    timeSlots: Array<{
      isMaintenanceBlocked: boolean;
      booking?: {
        status: string;
      } | null;
    }>;
  }>,
): AvailabilityInfo {
  let totalSlots = 0;
  let availableSlots = 0;
  let bookedSlots = 0;
  let maintenanceSlots = 0;

  for (const court of courts) {
    for (const slot of court.timeSlots) {
      totalSlots++;

      if (slot.isMaintenanceBlocked) {
        maintenanceSlots++;
      } else if (slot.booking && slot.booking.status === "CONFIRMED") {
        bookedSlots++;
      } else {
        availableSlots++;
      }
    }
  }

  const availabilityPercentage =
    totalSlots > 0 ? Math.round((availableSlots / totalSlots) * 100) : 0;

  let status: string;
  if (availabilityPercentage >= 80) {
    status = "Available Now";
  } else if (availabilityPercentage >= 50) {
    status = "Good Availability";
  } else if (availabilityPercentage >= 20) {
    status = "Limited Availability";
  } else if (availabilityPercentage > 0) {
    status = "Few Slots Left";
  } else {
    status = "Fully Booked";
  }

  return {
    totalSlots,
    availableSlots,
    bookedSlots,
    maintenanceSlots,
    availabilityPercentage,
    status,
  };
}

/**
 * Filter venues based on search criteria
 */
export interface VenueFilters {
  searchQuery?: string;
  sportType?: PrismaSportType | "ALL";
  venueType?: VenueType | "ALL";
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  location?: string;
}

export function filterVenues(
  venues: VenueListItem[],
  filters: VenueFilters,
): VenueListItem[] {
  return venues.filter((venue) => {
    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesName = venue.name.toLowerCase().includes(query);
      const matchesLocation = venue.location.toLowerCase().includes(query);
      const matchesSports = venue.sports.some((sport) =>
        sport.toLowerCase().includes(query),
      );

      if (!matchesName && !matchesLocation && !matchesSports) {
        return false;
      }
    }

    // Sport type filter
    if (filters.sportType && filters.sportType !== "ALL") {
      const sportName = SPORT_NAMES[filters.sportType];
      if (!venue.sports.includes(sportName)) {
        return false;
      }
    }

    // Venue type filter
    if (filters.venueType && filters.venueType !== "ALL") {
      const venueTypeName =
        VENUE_TYPE_MAPPING[filters.venueType as PrismaVenueType];
      if (venue.type !== venueTypeName) {
        return false;
      }
    }

    // Price range filter
    if (filters.minPrice !== undefined && venue.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== undefined && venue.price > filters.maxPrice) {
      return false;
    }

    // Rating filter
    if (filters.minRating !== undefined && venue.rating < filters.minRating) {
      return false;
    }

    // Location filter (basic string matching)
    if (filters.location) {
      const locationQuery = filters.location.toLowerCase();
      if (!venue.location.toLowerCase().includes(locationQuery)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort venues based on different criteria
 */
export type VenueSortOption =
  | "rating"
  | "price-low"
  | "price-high"
  | "name"
  | "availability";

export function sortVenues(
  venues: VenueListItem[],
  sortBy: VenueSortOption,
): VenueListItem[] {
  const sortedVenues = [...venues];

  switch (sortBy) {
    case "rating":
      return sortedVenues.sort((a, b) => b.rating - a.rating);

    case "price-low":
      return sortedVenues.sort((a, b) => a.price - b.price);

    case "price-high":
      return sortedVenues.sort((a, b) => b.price - a.price);

    case "name":
      return sortedVenues.sort((a, b) => a.name.localeCompare(b.name));

    case "availability":
      // Sort by availability status (Available Now first, then by rating)
      return sortedVenues.sort((a, b) => {
        if (
          a.availability === "Available Now" &&
          b.availability !== "Available Now"
        ) {
          return -1;
        }
        if (
          b.availability === "Available Now" &&
          a.availability !== "Available Now"
        ) {
          return 1;
        }
        return b.rating - a.rating; // Secondary sort by rating
      });

    default:
      return sortedVenues;
  }
}

/**
 * Rating calculation utilities
 */
export interface RatingStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Array<{
    rating: number;
    count: number;
    percentage: number;
  }>;
}

export function calculateRatingStats(
  reviews: Array<{ rating: number }>,
): RatingStats {
  const totalReviews = reviews.length;

  if (totalReviews === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: [5, 4, 3, 2, 1].map((rating) => ({
        rating,
        count: 0,
        percentage: 0,
      })),
    };
  }

  // Calculate average rating
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / totalReviews;

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((review) => review.rating === rating).length;
    const percentage = (count / totalReviews) * 100;
    return { rating, count, percentage };
  });

  return {
    averageRating,
    totalReviews,
    ratingDistribution,
  };
}

/**
 * Get venue statistics for dashboard or analytics
 */
export interface VenueStats {
  totalVenues: number;
  totalCourts: number;
  sportDistribution: Record<string, number>;
  averageRating: number;
  priceRange: PricingSummary;
}

export function calculateVenueStats(
  facilities: FacilityWithCourts[],
): VenueStats {
  const totalVenues = facilities.length;
  let totalCourts = 0;
  const sportCounts: Record<string, number> = {};
  const ratings: number[] = [];
  const allPrices: number[] = [];

  for (const facility of facilities) {
    const activeCourts = facility.courts.filter((court) => court.isActive);
    totalCourts += activeCourts.length;

    // Count sports
    for (const court of activeCourts) {
      const sportName = SPORT_NAMES[court.sportType];
      sportCounts[sportName] = (sportCounts[sportName] ?? 0) + 1;
      allPrices.push(court.pricePerHour);
    }

    // Collect ratings
    if (facility.rating) {
      ratings.push(facility.rating);
    }
  }

  const averageRating =
    ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : 0;

  const priceRange: PricingSummary =
    allPrices.length > 0
      ? {
          minPrice: Math.min(...allPrices),
          maxPrice: Math.max(...allPrices),
          averagePrice: Math.round(
            allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length,
          ),
          priceRange: `₹${Math.min(...allPrices)} - ₹${Math.max(...allPrices)}/hour`,
        }
      : {
          minPrice: 0,
          maxPrice: 0,
          averagePrice: 0,
          priceRange: "No pricing data",
        };

  return {
    totalVenues,
    totalCourts,
    sportDistribution: sportCounts,
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    priceRange,
  };
}
