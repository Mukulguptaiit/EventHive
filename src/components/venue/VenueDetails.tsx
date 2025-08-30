"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  X,
  Calendar,
  Loader2,
  AlertCircle,
  Wifi,
  Car,
  Coffee,
  ShowerHead,
  AirVent,
  Camera,
  Shield,
  Users,
  Zap,
  Star,
} from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Navbar } from "../home/Navbar";
import {
  getVenueById,
  getVenueTimeSlots,
  getVenueReviews,
} from "@/actions/venue-actions";
import {
  createPaymentOrder,
  verifyPayment,
  handlePaymentFailure,
} from "@/actions/payment-actions";
import type {
  VenueDetails as VenueDetailsType,
  TimeSlot,
} from "@/lib/venue-transformers";
import VenueReviews, { type VenueReview } from "./VenueReviews";
import RatingDisplay from "./RatingDisplay";
import ReviewForm from "./ReviewForm";
import { ReportForm } from "@/components/forms/report-form";
import { canReviewVenue } from "@/actions/venue-actions";
import { env } from "@/env";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface VenueDetailsProps {
  id: string;
}

export default function VenueDetails({ id }: VenueDetailsProps) {
  const router = useRouter();

  // Authentication state
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  // State for venue data
  const [venue, setVenue] = useState<VenueDetailsType | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [reviews, setReviews] = useState<VenueReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeSlotsLoading, setTimeSlotsLoading] = useState(false);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [reviewEligibility, setReviewEligibility] = useState<{
    canReview: boolean;
    reason?: string;
    existingReview?: { id: string; rating: number; comment: string | null };
  }>({ canReview: false });

  // UI state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSport, setSelectedSport] = useState("");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [consecutiveHours, setConsecutiveHours] = useState(1);

  // Payment state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Icon resolver function
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
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
    };
    return iconMap[iconName] ?? CheckCircle;
  };

  // Load venue data on component mount
  useEffect(() => {
    const loadVenueData = async () => {
      try {
        setLoading(true);
        setError(null);

        const venueData = await getVenueById(id);
        if (!venueData) {
          setError("Venue not found");
          return;
        }

        setVenue(venueData);

        // Set default sport selection
        if (venueData.sports.length > 0) {
          setSelectedSport(venueData.sports[0].name);
        }

        // Load initial reviews
        await loadReviews(id, 1);

        // Check review eligibility
        await checkReviewEligibility(id);
      } catch (err) {
        console.error("Error loading venue data:", err);
        setError("Failed to load venue data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      void loadVenueData();
    }
  }, [id]);

  // Load time slots when date or venue changes
  useEffect(() => {
    const loadTimeSlots = async () => {
      if (!venue) return;

      try {
        setTimeSlotsLoading(true);
        const slots = await getVenueTimeSlots(venue.id, selectedDate);
        setTimeSlots(slots);
        // Clear selected slots when date changes
        setSelectedSlots([]);
      } catch (err) {
        console.error("Error loading time slots:", err);
        setTimeSlots([]);
      } finally {
        setTimeSlotsLoading(false);
      }
    };

    void loadTimeSlots();
  }, [venue, selectedDate]);

  // Refresh time slots (can be called when booking dialog opens)
  const refreshTimeSlots = async () => {
    try {
      setTimeSlotsLoading(true);
      const slots = await getVenueTimeSlots(venue.id, selectedDate);
      setTimeSlots(slots);
      setSelectedSlots([]); // Clear selections on refresh
    } catch (err) {
      console.error("Error refreshing time slots:", err);
    } finally {
      setTimeSlotsLoading(false);
    }
  };

  // Load reviews for the venue
  const loadReviews = async (venueId: string, page: number) => {
    try {
      setReviewsLoading(true);
      const reviewData = await getVenueReviews(venueId, page, 10);

      if (page === 1) {
        setReviews(reviewData.reviews);
      } else {
        setReviews((prev) => [...prev, ...reviewData.reviews]);
      }

      setTotalReviews(reviewData.totalReviews);
      setAverageRating(reviewData.averageRating);
      setHasMoreReviews(reviewData.hasMore);
      setReviewsPage(page);
    } catch (err) {
      console.error("Error loading reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Load more reviews
  const loadMoreReviews = async () => {
    if (!venue || reviewsLoading || !hasMoreReviews) return;
    await loadReviews(venue.id, reviewsPage + 1);
  };

  // Check if user can review this venue
  const checkReviewEligibility = async (venueId: string) => {
    try {
      const eligibility = await canReviewVenue(venueId);
      setReviewEligibility(eligibility);
      setCanReview(eligibility.canReview);
    } catch (err) {
      console.error("Error checking review eligibility:", err);
      setCanReview(false);
    }
  };

  // Handle review submission success
  const handleReviewSubmitted = async () => {
    setShowReviewForm(false);
    // Reload reviews to show the new review
    if (venue) {
      await loadReviews(venue.id, 1);
      await checkReviewEligibility(venue.id);
    }
  };

  const nextImage = () => {
    if (venue?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % venue.images.length);
    }
  };

  const prevImage = () => {
    if (venue?.images) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + venue.images.length) % venue.images.length,
      );
    }
  };

  const toggleSlot = (timeSlotId: string) => {
    // Find the specific slot by timeSlotId (unique identifier)
    const slotIndex = timeSlots.findIndex(
      (slot) => slot.timeSlotId === timeSlotId,
    );

    if (slotIndex === -1) {
      console.error("Slot not found for timeSlotId:", timeSlotId);
      return;
    }

    // If clicking on any selected slot, clear all selections
    if (selectedSlots.includes(timeSlotId)) {
      setSelectedSlots([]);
      return;
    }

    // Check if we can select consecutive slots starting from this slot
    const canSelect = canSelectConsecutiveSlots(slotIndex, consecutiveHours);
    if (!canSelect) {
      return; // Can't select consecutive slots from this position
    }

    // Get the starting slot to determine the court
    const startSlot = timeSlots[slotIndex];

    // Get all slots for the same court
    const sameCourtSlots = timeSlots.filter(
      (slot) => slot.courtId === startSlot.courtId,
    );

    // Find the index of the start slot within the same court's slots
    const courtSlotIndex = sameCourtSlots.findIndex(
      (slot) => slot.timeSlotId === startSlot.timeSlotId,
    );

    // Build consecutive slots array from the same court
    const consecutiveSlots: string[] = [];
    for (let i = 0; i < consecutiveHours; i++) {
      const targetSlot = sameCourtSlots[courtSlotIndex + i];
      if (targetSlot?.available) {
        consecutiveSlots.push(targetSlot.timeSlotId);
      } else {
        // This shouldn't happen if canSelect returned true, but safety check
        console.error(
          "Unexpected unavailable slot at court index:",
          courtSlotIndex + i,
        );
        return;
      }
    }

    // Set the new selection
    setSelectedSlots(consecutiveSlots);
  };

  // Authentication and booking handlers
  const handleBookingButtonClick = () => {
    if (!session) {
      // Save current venue URL to return here after login
      const currentUrl = window.location.pathname + window.location.search;
      sessionStorage.setItem("returnUrl", currentUrl);

      toast.info("Please log in to book this venue");
      router.push("/auth/login");
      return;
    }

    // User is authenticated, open booking dialog and refresh slots
    setIsBookingOpen(true);
    void refreshTimeSlots();
  };

  // Payment handlers
  const handlePaymentSuccess = async (
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ) => {
    // Prevent duplicate processing
    if (isProcessingPayment) {
      console.log("Payment already being processed, skipping...");
      return;
    }

    try {
      setIsProcessingPayment(true);
      setPaymentError(null);

      const result = await verifyPayment(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      );

      if (result.success) {
        toast.success(
          "Payment successful! Your booking has been confirmed. Redirecting to your bookings...",
        );
        setIsBookingOpen(false);
        setSelectedSlots([]);

        // Small delay to let user see the success message, then redirect
        setTimeout(() => {
          router.push("/profile?tab=bookings");
        }, 1000);

        // Refresh time slots to show updated availability
        await refreshTimeSlots();
      } else {
        throw new Error(result.error || "Payment verification failed");
      }
    } catch (error) {
      console.error("Payment verification error:", error);

      // Check if this is a payment already processed error
      const errorMessage =
        error instanceof Error ? error.message : "Payment verification failed";

      const isPaymentAlreadyProcessed =
        errorMessage.includes("already processed") ||
        errorMessage.includes("already verified") ||
        errorMessage.includes("SUCCESSFUL") ||
        errorMessage.includes("PROCESSING") ||
        errorMessage.includes("already confirmed");

      const isBookingPending =
        errorMessage.includes("booking still pending") ||
        errorMessage.includes("no booking found");

      if (!isPaymentAlreadyProcessed && !isBookingPending) {
        setPaymentError(errorMessage);
        toast.error("Payment verification failed. Please contact support.");
        // Reopen booking dialog for genuine errors
        setIsBookingOpen(true);
      } else if (isBookingPending) {
        // Payment processed but booking creation is still pending
        toast.success(
          "Payment successful! Your booking is being confirmed. Redirecting to your bookings...",
        );
        setTimeout(() => {
          router.push("/profile?tab=bookings");
        }, 3000);
      } else {
        // Payment was already processed completely
        toast.success(
          "Payment already confirmed! Redirecting to your bookings...",
        );
        setTimeout(() => {
          router.push("/profile?tab=bookings");
        }, 1000);
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const initializeRazorpayPayment = async () => {
    try {
      setIsProcessingPayment(true);
      setPaymentError(null);

      if (!venue) throw new Error("Venue not found");
      if (selectedSlots.length === 0) throw new Error("No slots selected");

      // Get the first selected court (assumes all slots are from same court)
      const firstSlot = timeSlots.find((slot) =>
        selectedSlots.includes(slot.timeSlotId),
      );
      if (!firstSlot) throw new Error("Selected slot not found");

      const courtId = firstSlot.courtId;
      const totalAmount = getTotalPrice();

      // Create booking slots data
      const bookingSlots = selectedSlots.map((timeSlotId) => {
        const slot = timeSlots.find((s) => s.timeSlotId === timeSlotId);
        return {
          timeSlotId: slot?.timeSlotId || "",
          startTime: slot?.time || "",
          endTime: slot?.time || "", // You might want to calculate end time properly
          date: format(selectedDate, "yyyy-MM-dd"),
        };
      });

      // Create payment order
      const orderResult = await createPaymentOrder(
        venue.id,
        courtId,
        bookingSlots,
        totalAmount,
      );

      if (!orderResult.success || !orderResult.razorpayOrderId) {
        throw new Error(orderResult.error || "Failed to create payment order");
      }

      // Close the booking dialog before opening payment gateway
      setIsBookingOpen(false);

      // Load Razorpay script dynamically
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const options = {
          key: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: Math.round(totalAmount * 100), // Convert to paise
          currency: "INR",
          name: "QuickCourt",
          description: `Booking for ${venue.name}`,
          order_id: orderResult.razorpayOrderId,
          handler: async function (response: any) {
            await handlePaymentSuccess(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
            );
          },
          prefill: {
            name: session?.user?.name || "User",
            email: session?.user?.email || "",
          },
          notes: {
            venue_id: venue.id,
            court_id: courtId,
            date: format(selectedDate, "yyyy-MM-dd"),
            slots: selectedSlots
              .map((timeSlotId) => {
                const slot = timeSlots.find((s) => s.timeSlotId === timeSlotId);
                return slot?.time;
              })
              .filter(Boolean)
              .join(", "),
          },
          theme: {
            color: "#059669", // Emerald color to match your theme
          },
          modal: {
            ondismiss: function () {
              setIsProcessingPayment(false);
              // Reopen booking dialog if payment was cancelled/dismissed
              setIsBookingOpen(true);
              // Handle payment failure/cancellation
              if (orderResult.razorpayOrderId) {
                // Call handlePaymentFailure but don't await to avoid blocking
                handlePaymentFailure(orderResult.razorpayOrderId).catch(
                  (error) => {
                    console.error("Error handling payment failure:", error);
                  },
                );
              }
            },
          },
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      };

      script.onerror = () => {
        throw new Error("Failed to load payment gateway");
      };

      document.body.appendChild(script);
    } catch (error) {
      console.error("Payment initialization error:", error);
      setPaymentError(
        error instanceof Error ? error.message : "Failed to initialize payment",
      );
      toast.error("Failed to initialize payment. Please try again.");
      setIsProcessingPayment(false);
    }
  };

  const canSelectConsecutiveSlots = (startIndex: number, hours: number) => {
    // Get the starting slot to check which court we're dealing with
    const startSlot = timeSlots[startIndex];
    if (!startSlot?.available) {
      return false;
    }

    // Get all slots for the same court
    const sameCourtSlots = timeSlots.filter(
      (slot) => slot.courtId === startSlot.courtId,
    );

    // Find the index of the start slot within the same court's slots
    const courtSlotIndex = sameCourtSlots.findIndex(
      (slot) => slot.timeSlotId === startSlot.timeSlotId,
    );

    if (courtSlotIndex === -1) {
      return false;
    }

    // Check if we have enough consecutive available slots within the same court
    for (let i = 0; i < hours; i++) {
      const slot = sameCourtSlots[courtSlotIndex + i];
      if (!slot?.available) {
        return false;
      }
    }

    return true;
  };

  const getTotalPrice = () => {
    return selectedSlots.reduce((total, timeSlotId) => {
      const slot = timeSlots.find((s) => s.timeSlotId === timeSlotId);
      return total + (slot?.price ?? 0);
    }, 0);
  };

  // Group slots by unique time periods to avoid showing duplicates
  const getGroupedTimeSlots = () => {
    const timeGroups = new Map<
      string,
      {
        time: string;
        price: number;
        availableCourts: TimeSlot[];
        totalSlots: number;
        hasAvailability: boolean;
      }
    >();

    // Group all slots by time
    timeSlots.forEach((slot) => {
      const existing = timeGroups.get(slot.time);
      if (existing) {
        existing.totalSlots++;
        if (slot.available) {
          existing.availableCourts.push(slot);
          existing.hasAvailability = true;
        }
      } else {
        timeGroups.set(slot.time, {
          time: slot.time,
          price: slot.price,
          availableCourts: slot.available ? [slot] : [],
          totalSlots: 1,
          hasAvailability: slot.available,
        });
      }
    });

    return Array.from(timeGroups.values()).sort((a, b) => {
      const timeA = new Date(`1970/01/01 ${a.time.split(" - ")[0]}`);
      const timeB = new Date(`1970/01/01 ${b.time.split(" - ")[0]}`);
      return timeA.getTime() - timeB.getTime();
    });
  };

  // Handle clicking on a grouped time slot
  const handleTimeSlotClick = (timeGroup: {
    time: string;
    price: number;
    availableCourts: TimeSlot[];
    totalSlots: number;
    hasAvailability: boolean;
  }) => {
    // Check if this time is already selected
    const isTimeSelected = selectedSlots.some((selectedId) => {
      const selectedSlot = timeSlots.find(
        (slot) => slot.timeSlotId === selectedId,
      );
      return selectedSlot?.time === timeGroup.time;
    });

    if (isTimeSelected) {
      // Deselect all slots for this time
      const slotsToRemove = selectedSlots.filter((selectedId) => {
        const selectedSlot = timeSlots.find(
          (slot) => slot.timeSlotId === selectedId,
        );
        return selectedSlot?.time === timeGroup.time;
      });
      setSelectedSlots((prev) =>
        prev.filter((id) => !slotsToRemove.includes(id)),
      );
      return;
    }

    // Find the best available court for this time
    let bestCourt: TimeSlot | null = null;

    if (consecutiveHours === 1) {
      // For single slot, just pick the first available court
      bestCourt = timeGroup.availableCourts[0] || null;
    } else {
      // For consecutive slots, find a court that can accommodate the full duration
      for (const court of timeGroup.availableCourts) {
        const courtIndex = timeSlots.findIndex(
          (s) => s.timeSlotId === court.timeSlotId,
        );
        if (canSelectConsecutiveSlots(courtIndex, consecutiveHours)) {
          bestCourt = court;
          break;
        }
      }
    }

    if (bestCourt) {
      toggleSlot(bestCourt.timeSlotId);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-emerald-600" />
              <p className="text-gray-600">Loading venue details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !venue) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <AlertCircle className="mx-auto mb-4 h-8 w-8 text-red-500" />
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                {error && "Venue not found"}
              </h2>
              <p className="mb-4 text-gray-600">
                The venue you&apos;re looking for doesn&apos;t exist or
                couldn&apos;t be loaded.
              </p>
              <Button onClick={() => window.history.back()} variant="outline">
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Venue Header */}
        <div className="mb-8">
          <div className="mb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-gray-900">
                {venue.name}
              </h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-5 w-5" />
                  <span>{venue.location}</span>
                </div>
                <RatingDisplay
                  rating={averageRating || venue.rating}
                  showNumber={true}
                  showTotal={true}
                  totalReviews={totalReviews || venue.reviews}
                  size="md"
                />
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-3 lg:mt-0">
              <Button variant="outline" size="sm">
                <Heart className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <ReportForm
                targetType="facility"
                targetId={venue.id}
                targetName={venue.name}
              />
            </div>
          </div>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Image Gallery */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="relative h-96 bg-gray-100">
                <Image
                  src={venue.images[currentImageIndex] ?? "/placeholder.svg"}
                  alt={`${venue.name} - Image ${currentImageIndex + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />

                {/* Navigation Arrows - only show if multiple images */}
                {venue.images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute top-1/2 left-4 -translate-y-1/2 transform bg-white/80 hover:bg-white"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute top-1/2 right-4 -translate-y-1/2 transform bg-white/80 hover:bg-white"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>

                    {/* Image Indicators */}
                    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform space-x-2">
                      {venue.images.map((_, index) => (
                        <button
                          key={index}
                          className={`h-2 w-2 rounded-full transition-colors ${
                            index === currentImageIndex
                              ? "bg-white"
                              : "bg-white/50"
                          }`}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>

                    {/* Image Counter */}
                    <div className="absolute top-4 right-4 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                      {currentImageIndex + 1} / {venue.images.length}
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Booking Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-emerald-600">
                      ₹{venue.price}
                    </div>
                    <div className="text-sm text-gray-500">per hour</div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    Available Now
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="h-12 w-full bg-emerald-600 text-lg hover:bg-emerald-700 disabled:opacity-50"
                  onClick={handleBookingButtonClick}
                  disabled={sessionLoading}
                >
                  {sessionLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : !session ? (
                    "Log In to Book"
                  ) : (
                    "Book This Venue"
                  )}
                </Button>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Operating Hours
                    </span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">
                        {venue.operatingHours}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm text-gray-600">Address</span>
                    <p className="text-sm">{venue.fullAddress}</p>
                  </div>

                  {(venue.phone ?? venue.email) && (
                    <div className="flex items-center space-x-4">
                      {venue.phone && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => window.open(`tel:${venue.phone}`)}
                        >
                          <Phone className="mr-2 h-4 w-4" />
                          Call
                        </Button>
                      )}
                      {venue.email && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => window.open(`mailto:${venue.email}`)}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Email
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Booking Dialog - moved outside of the booking panel */}
        <Dialog
          open={isBookingOpen}
          onOpenChange={(open) => {
            setIsBookingOpen(open);
            if (open) {
              // Refresh time slots when dialog opens for real-time data
              void refreshTimeSlots();
            }
          }}
        >
          <DialogContent className="max-h-[90vh] min-w-6xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-3xl">Book {venue.name}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 text-lg font-semibold">Select Date</h3>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground",
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-semibold">Select Sport</h3>
                  <Select
                    value={selectedSport}
                    onValueChange={setSelectedSport}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a sport" />
                    </SelectTrigger>
                    <SelectContent>
                      {venue.sports.map((sport) => (
                        <SelectItem key={sport.name} value={sport.name}>
                          {sport.icon} {sport.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-semibold">
                    Duration (Hours)
                  </h3>
                  <Select
                    value={consecutiveHours.toString()}
                    onValueChange={(value) => {
                      setConsecutiveHours(parseInt(value));
                      setSelectedSlots([]); // Clear selection when duration changes
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Hour</SelectItem>
                      <SelectItem value="2">2 Hours</SelectItem>
                      <SelectItem value="3">3 Hours</SelectItem>
                      <SelectItem value="4">4 Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="lg:col-span-2">
                <h3 className="mb-4 text-lg font-semibold">
                  Available Time Slots
                  {consecutiveHours > 1 && (
                    <span className="ml-2 text-sm font-normal text-gray-600">
                      (Select start time for {consecutiveHours} consecutive
                      hours)
                    </span>
                  )}
                </h3>

                {consecutiveHours > 1 && (
                  <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <div className="flex items-start space-x-2 text-sm text-blue-700">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Consecutive Booking Mode</p>
                        <p className="mt-1 text-xs">
                          You&apos;re booking {consecutiveHours} consecutive
                          hours. Only slots with {consecutiveHours} available
                          hours following them can be selected. Grayed-out slots
                          don&apos;t have enough consecutive availability.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {timeSlotsLoading ? (
                  <div className="flex h-40 items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-emerald-600" />
                      <p className="text-sm text-gray-600">
                        Loading time slots...
                      </p>
                    </div>
                  </div>
                ) : timeSlots.length === 0 ? (
                  <div className="flex h-40 items-center justify-center">
                    <div className="text-center">
                      <AlertCircle className="mx-auto mb-2 h-6 w-6 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        No time slots available for this date
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid max-h-80 grid-cols-3 gap-3 overflow-y-auto pr-2 md:grid-cols-4">
                    {getGroupedTimeSlots().map((timeGroup) => {
                      const isTimeSelected = selectedSlots.some(
                        (selectedId) => {
                          const selectedSlot = timeSlots.find(
                            (slot) => slot.timeSlotId === selectedId,
                          );
                          return selectedSlot?.time === timeGroup.time;
                        },
                      );

                      const canSelect = timeGroup.hasAvailability;

                      // For consecutive hours, check if we can get consecutive slots starting from this time
                      const canSelectConsecutive =
                        consecutiveHours > 1
                          ? timeGroup.availableCourts.some((slot) => {
                              const slotIndex = timeSlots.findIndex(
                                (s) => s.timeSlotId === slot.timeSlotId,
                              );
                              return canSelectConsecutiveSlots(
                                slotIndex,
                                consecutiveHours,
                              );
                            })
                          : true;

                      const finalCanSelect = canSelect && canSelectConsecutive;

                      // Determine slot state for better UX
                      const isUnavailable = !timeGroup.hasAvailability;
                      const isAvailableButNotSelectable =
                        timeGroup.hasAvailability &&
                        !finalCanSelect &&
                        consecutiveHours > 1;

                      return (
                        <Button
                          key={timeGroup.time}
                          variant={isTimeSelected ? "default" : "outline"}
                          size="sm"
                          disabled={!finalCanSelect}
                          onClick={() => handleTimeSlotClick(timeGroup)}
                          className={`flex h-auto flex-col p-3 text-xs transition-all ${
                            isTimeSelected
                              ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
                              : isUnavailable
                                ? "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400"
                                : isAvailableButNotSelectable
                                  ? "cursor-not-allowed border-orange-200 bg-orange-50 text-orange-600"
                                  : "hover:border-emerald-300 hover:bg-emerald-50"
                          }`}
                        >
                          <span className="text-center font-medium">
                            {timeGroup.time}
                          </span>
                          <span className="font-bold">₹{timeGroup.price}</span>
                          {isUnavailable && (
                            <span className="mt-1 text-xs text-gray-500">
                              Booked
                            </span>
                          )}
                          {isAvailableButNotSelectable && (
                            <span className="mt-1 text-center text-xs leading-tight text-orange-600">
                              Need {consecutiveHours}h consecutive
                            </span>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {selectedSlots.length > 0 && (
              <div className="mt-8 rounded-lg bg-gray-50 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-lg font-semibold">
                    Booking Summary:
                  </span>
                  <span className="text-3xl font-bold text-emerald-600">
                    ₹{getTotalPrice()}
                  </span>
                </div>
                <div className="mb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {format(selectedDate, "PPP")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sport:</span>
                    <span className="font-medium">{selectedSport}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">
                      {consecutiveHours} hour
                      {consecutiveHours > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Time Slots:</span>
                    <span className="font-medium">
                      {selectedSlots
                        .map((timeSlotId) => {
                          const slot = timeSlots.find(
                            (s) => s.timeSlotId === timeSlotId,
                          );
                          return slot?.time;
                        })
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                </div>
                {paymentError && (
                  <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {paymentError}
                  </div>
                )}
                <Button
                  className="h-12 w-full bg-emerald-600 text-lg hover:bg-emerald-700 disabled:opacity-50"
                  onClick={initializeRazorpayPayment}
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    `Confirm Booking - ₹${getTotalPrice()}`
                  )}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Sports Available */}
            <Card>
              <CardHeader>
                <CardTitle>Sports Available</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {venue.sports.map((sport) => (
                    <div
                      key={sport.name}
                      className="flex items-center space-x-4 rounded-lg bg-gray-50 p-4"
                    >
                      <div className="text-3xl">{sport.icon}</div>
                      <div>
                        <div className="font-semibold">{sport.name}</div>
                        <div className="text-sm text-gray-600">
                          {sport.courts} courts available
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="amenities" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {venue.amenities.map((amenity) => {
                    const IconComponent = getIconComponent(amenity.iconName);
                    return (
                      <div
                        key={amenity.name}
                        className={`flex items-center space-x-3 rounded-lg p-3 ${
                          amenity.available
                            ? "bg-green-50 text-green-800"
                            : "bg-gray-50 text-gray-400"
                        }`}
                      >
                        <IconComponent className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          {amenity.name}
                        </span>
                        {amenity.available ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Venue Policies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {venue.policies.map((policy, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                      <span className="text-gray-700">{policy}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-8">
            {/* Review Form Section */}
            {showReviewForm ? (
              <ReviewForm
                venueId={venue.id}
                venueName={venue.name}
                existingReview={reviewEligibility.existingReview}
                onReviewSubmitted={handleReviewSubmitted}
                onCancel={() => setShowReviewForm(false)}
              />
            ) : (
              canReview && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Share Your Experience</h3>
                        <p className="text-sm text-gray-600">
                          Help others by writing a review for this venue
                        </p>
                      </div>
                      <Button
                        onClick={() => setShowReviewForm(true)}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Star className="mr-2 h-4 w-4" />
                        Write Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            )}

            {/* Existing Review Notice */}
            {reviewEligibility.existingReview && !showReviewForm && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-blue-900">
                          You&apos;ve already reviewed this venue
                        </h3>
                        <div className="mt-1 flex items-center space-x-2">
                          <RatingDisplay
                            rating={reviewEligibility.existingReview.rating}
                            size="sm"
                            showNumber={false}
                          />
                          <span className="text-sm text-blue-700">
                            {reviewEligibility.existingReview.rating}/5
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowReviewForm(true)}
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      Edit Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <VenueReviews
              venueId={venue.id}
              reviews={reviews}
              averageRating={averageRating || venue.rating}
              totalReviews={totalReviews || venue.reviews}
              loading={reviewsLoading}
              onLoadMore={loadMoreReviews}
              hasMore={hasMoreReviews}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
