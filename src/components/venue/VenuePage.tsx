"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryState, parseAsInteger } from "nuqs";
import {
  Search,
  MapPin,
  Filter,
  Heart,
  Share2,
  Clock,
  Users,
  Zap,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Navbar } from "@/components/home/Navbar";
import {
  ErrorBoundary,
  VenueErrorFallback,
} from "@/components/ui/error-boundary";
import { getVenues } from "@/actions/venue-actions";
import type { VenueListItem } from "@/lib/venue-transformers";
import RatingDisplay from "./RatingDisplay";
import type { SportType, VenueType } from "@/types/venue";

// Sport types mapping from database enum to display names
const sportTypes = [
  { value: "ALL", label: "All Sports" },
  { value: "BADMINTON", label: "Badminton" },
  { value: "TENNIS", label: "Tennis" },
  { value: "FOOTBALL", label: "Football" },
  { value: "CRICKET", label: "Cricket" },
  { value: "BASKETBALL", label: "Basketball" },
  { value: "VOLLEYBALL", label: "Volleyball" },
  { value: "SQUASH", label: "Squash" },
  { value: "TABLE_TENNIS", label: "Table Tennis" },
];

const venueTypes = [
  { value: "ALL", label: "All Types" },
  { value: "INDOOR", label: "Indoor" },
  { value: "OUTDOOR", label: "Outdoor" },
  { value: "MIXED", label: "Mixed" },
];

export default function VenuesPage() {
  const router = useRouter();

  const [location] = useQueryState("location", {
    defaultValue: "",
  });
  const [searchQuery, setSearchQuery] = useQueryState("search", {
    defaultValue: "",
  });
  const [selectedSport, setSelectedSport] = useQueryState("sport", {
    defaultValue: "ALL",
  });
  const [selectedVenueType, setSelectedVenueType] = useQueryState("type", {
    defaultValue: "ALL",
  });
  const [minPrice, setMinPrice] = useQueryState(
    "minPrice",
    parseAsInteger.withDefault(100),
  );
  const [maxPrice, setMaxPrice] = useQueryState(
    "maxPrice",
    parseAsInteger.withDefault(2000),
  );
  const [minRating, setMinRating] = useQueryState(
    "minRating",
    parseAsInteger.withDefault(0),
  );
  const [currentPage, setCurrentPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1),
  );
  const [sortBy, setSortBy] = useQueryState("sort", { defaultValue: "rating" });

  // Local UI state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);

  // State for data and loading
  const [venues, setVenues] = useState<VenueListItem[]>([]);
  const [totalVenues, setTotalVenues] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination constants
  const itemsPerPage = 6;

  // Sync price range with URL state
  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  // Update URL state when price range changes
  const handlePriceRangeChange = useCallback(
    (newRange: number[]) => {
      setPriceRange(newRange);
      void setMinPrice(newRange[0]);
      void setMaxPrice(newRange[1]);
    },
    [setMinPrice, setMaxPrice],
  );

  // Fetch venues from database
  const fetchVenues = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        const filters = {
          location: location.trim() || undefined,
          searchQuery: searchQuery.trim() || undefined,
          sportType:
            selectedSport !== "ALL" ? (selectedSport as SportType) : undefined,
          venueType:
            selectedVenueType !== "ALL"
              ? (selectedVenueType as VenueType)
              : undefined,
          minPrice: minPrice,
          maxPrice: maxPrice,
          minRating: minRating > 0 ? minRating : undefined,
          sortBy: sortBy as
            | "rating"
            | "price-low"
            | "price-high"
            | "name"
            | "availability",
          limit: itemsPerPage,
          offset: (currentPage - 1) * itemsPerPage,
        };

        const result = await getVenues(filters);
        setVenues(result.venues);
        setTotalVenues(result.total);
      } catch (err) {
        console.error("Error fetching venues:", err);
        setError("Failed to load venues. Please try again.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [
      location,
      searchQuery,
      selectedSport,
      selectedVenueType,
      minPrice,
      maxPrice,
      minRating,
      sortBy,
      currentPage,
      itemsPerPage,
    ],
  );

  // Initial load
  useEffect(() => {
    void fetchVenues();
  }, [fetchVenues]);

  // Reset to page 1 when filters change (but not pagination)
  useEffect(() => {
    void setCurrentPage(1);
  }, [
    location,
    searchQuery,
    selectedSport,
    selectedVenueType,
    minPrice,
    maxPrice,
    minRating,
    sortBy,
    setCurrentPage,
  ]);

  // Refetch when filters change (with debounce for search)
  useEffect(() => {
    const timeoutId = setTimeout(
      () => {
        if (!isLoading) {
          void fetchVenues();
        }
      },
      searchQuery ? 500 : 0,
    ); // Debounce search queries

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchVenues, searchQuery]);

  // Server-side pagination and filtering is handled by the backend
  const totalPages = Math.ceil(totalVenues / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVenues = venues; // Already paginated from server

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-semibold">Sport Type</h3>
        <Select value={selectedSport} onValueChange={setSelectedSport}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sportTypes.map((sport) => (
              <SelectItem key={sport.value} value={sport.value}>
                {sport.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="mb-3 font-semibold">Venue Type</h3>
        <Select value={selectedVenueType} onValueChange={setSelectedVenueType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {venueTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="mb-3 font-semibold">Price Range (per hour)</h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={handlePriceRangeChange}
            max={2000}
            min={100}
            step={50}
            className="mb-2"
          />
          <div className="text-muted-foreground flex justify-between text-sm">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-semibold">Minimum Rating</h3>
        <div className="space-y-2">
          {[4.5, 4.0, 3.5, 3.0].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={minRating === rating}
                onCheckedChange={(checked) =>
                  void setMinRating(checked ? rating : 0)
                }
              />
              <Label
                htmlFor={`rating-${rating}`}
                className="flex items-center space-x-1"
              >
                <RatingDisplay rating={rating} showNumber={true} size="xs" />
                <span className="text-muted-foreground text-sm">& up</span>
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={VenueErrorFallback}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar />
        <div className="mx-auto max-w-full px-6 py-6 sm:px-8 lg:px-12">
          {/* Hero Section */}
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-4xl font-bold text-gray-900">
              Sports Venues{location ? " in " : ""}
              {location && <span className="text-emerald-600">{location}</span>}
            </h1>
            <p className="text-lg text-gray-600">
              Discover and book nearby venues for your favorite sports
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search venues by name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 pl-10"
                />
              </div>

              {/* Desktop Filters */}
              <div className="hidden items-center space-x-4 lg:flex">
                <Select value={selectedSport} onValueChange={setSelectedSport}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sportTypes.map((sport) => (
                      <SelectItem key={sport.value} value={sport.value}>
                        {sport.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedVenueType}
                  onValueChange={setSelectedVenueType}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {venueTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mobile Filter Button */}
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-transparent lg:hidden"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter Venues</SheetTitle>
                    <SheetDescription>
                      Refine your search to find the perfect venue
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="flex gap-5 xl:gap-6 2xl:gap-8">
            {/* Desktop Sidebar Filters */}
            <div className="hidden w-72 shrink-0 lg:block xl:w-80 2xl:w-84">
              <Card className="sticky top-4">
                <CardContent className="p-5">
                  <h2 className="mb-4 flex items-center text-lg font-semibold">
                    <Filter className="mr-2 h-5 w-5" />
                    Filters
                  </h2>
                  <FilterContent />
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="min-w-0 flex-1">
              {/* Results Header */}
              <div className="mb-5 flex items-center justify-between">
                {isLoading ? (
                  <Skeleton className="h-5 w-48" />
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-gray-600">
                      Showing {startIndex + 1}-
                      {Math.min(startIndex + itemsPerPage, totalVenues)} of{" "}
                      {totalVenues} venues
                    </p>
                    {isRefreshing && (
                      <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {error && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchVenues(true)}
                      disabled={isRefreshing}
                    >
                      <RefreshCw
                        className={`mr-1 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                      />
                      Retry
                    </Button>
                  )}
                  <Select
                    value={sortBy}
                    onValueChange={setSortBy}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Sort by Rating</SelectItem>
                      <SelectItem value="price-low">
                        Price: Low to High
                      </SelectItem>
                      <SelectItem value="price-high">
                        Price: High to Low
                      </SelectItem>
                      <SelectItem value="name">Name A-Z</SelectItem>
                      <SelectItem value="availability">Availability</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Error State */}
              {error && !isLoading && (
                <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                  <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-500" />
                  <h3 className="mb-2 text-lg font-semibold text-red-800">
                    Unable to Load Venues
                  </h3>
                  <p className="mb-4 text-red-600">{error}</p>
                  <Button
                    onClick={() => fetchVenues(true)}
                    disabled={isRefreshing}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <RefreshCw
                      className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                    />
                    Try Again
                  </Button>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <Card key={index} className="overflow-hidden">
                      <Skeleton className="h-48 w-full" />
                      <CardContent className="p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                        <Skeleton className="mb-3 h-4 w-1/2" />
                        <div className="mb-3 flex gap-1">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-6 w-20" />
                        </div>
                        <div className="mb-4 flex items-center justify-between">
                          <Skeleton className="h-8 w-20" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-10 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && totalVenues === 0 && (
                <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                    <MapPin className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-800">
                    No Venues Found
                  </h3>
                  <p className="mx-auto mb-6 max-w-md text-gray-600">
                    We couldn&apos;t find any venues matching your criteria. Try
                    adjusting your filters or search terms.
                  </p>
                  <div className="flex flex-col justify-center gap-3 sm:flex-row">
                    <Button
                      variant="outline"
                      onClick={() => {
                        void setSearchQuery("");
                        void setSelectedSport("ALL");
                        void setSelectedVenueType("ALL");
                        void setMinPrice(100);
                        void setMaxPrice(1500);
                        void setMinRating(0);
                        setPriceRange([100, 1500]);
                      }}
                    >
                      Clear All Filters
                    </Button>
                    <Button
                      onClick={() => fetchVenues(true)}
                      disabled={isRefreshing}
                    >
                      <RefreshCw
                        className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                      />
                      Refresh
                    </Button>
                  </div>
                </div>
              )}

              {/* Venue Grid */}
              {!isLoading && !error && totalVenues > 0 && (
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {paginatedVenues.map((venue) => (
                    <Card
                      key={venue.id}
                      className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-emerald-100/50"
                    >
                      <div className="relative">
                        <Image
                          src={venue.image || "/placeholder.svg"}
                          alt={venue.name}
                          width={300}
                          height={200}
                          className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-3 right-3 flex space-x-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 w-8 bg-white/80 p-0 hover:bg-white"
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 w-8 bg-white/80 p-0 hover:bg-white"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="absolute top-3 left-3">
                          <Badge
                            variant={
                              venue.type === "Indoor" ? "default" : "secondary"
                            }
                            className="bg-white/90 text-gray-800"
                          >
                            {venue.type}
                          </Badge>
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <Badge
                            variant="secondary"
                            className="border-emerald-200 bg-emerald-100 text-emerald-800"
                          >
                            <Zap className="mr-1 h-3 w-3" />
                            {venue.availability}
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <h3 className="text-lg font-semibold transition-colors group-hover:text-emerald-600">
                            {venue.name}
                          </h3>
                          <RatingDisplay
                            rating={venue.rating}
                            showNumber={true}
                            showTotal={true}
                            totalReviews={venue.reviews}
                            size="sm"
                            className="text-sm"
                          />
                        </div>

                        <div className="mb-3 flex items-center text-gray-600">
                          <MapPin className="mr-1 h-4 w-4" />
                          <span className="text-sm">{venue.location}</span>
                        </div>

                        <div className="mb-3 flex flex-wrap gap-1">
                          {venue.sports.map((sport) => (
                            <Badge
                              key={sport}
                              variant="outline"
                              className="text-xs"
                            >
                              {sport}
                            </Badge>
                          ))}
                        </div>

                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-2xl font-bold text-emerald-600">
                              ₹{venue.price}
                            </span>
                            <span className="text-sm text-gray-500">/hour</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Users className="mr-1 h-4 w-4" />
                            <span>{venue.amenities.length} amenities</span>
                          </div>
                        </div>

                        <Button
                          className="w-full bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => router.push(`/venues/${venue.id}`)}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!isLoading && !error && totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>

                  {[...Array<number>(totalPages)].map((_, i) => (
                    <Button
                      key={i + 1}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      onClick={() => setCurrentPage(i + 1)}
                      className={
                        currentPage === i + 1
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : ""
                      }
                    >
                      {i + 1}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
