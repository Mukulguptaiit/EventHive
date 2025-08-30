"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Share2, 
  Heart,
  ArrowLeft,
  Ticket,
  Phone,
  Mail,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  city: string;
  state: string;
  coverImage: string;
  isFree: boolean;
  minPrice: number;
  maxPrice: number;
  currentAttendees: number;
  maxAttendees: number;
  featured: boolean;
  trending: boolean;
  rating: number;
  reviewCount: number;
  organizer?: {
    name: string;
    email: string;
    phone: string;
    website: string;
    socialMedia?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
    };
  };
  tickets?: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    available: number;
    sold: number;
    benefits: string[];
  }>;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${params.eventId}`);
        if (response.ok) {
          const data = await response.json();
          setEvent(data.event);
        } else {
          // Fallback to sample data
          setEvent(getSampleEvent(params.eventId as string));
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        // Fallback to sample data
        setEvent(getSampleEvent(params.eventId as string));
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.eventId]);

  const getSampleEvent = (eventId: string): Event => {
    const sampleEvents: { [key: string]: Event } = {
      "1": {
        id: "1",
        title: "Summer Music Festival 2024",
        description: "Join us for the biggest music festival of the year featuring top artists and DJs from around the world. Experience electrifying performances, amazing food, and unforgettable memories. This year's lineup includes international superstars, local talent, and surprise performances that will keep you dancing all night long. With multiple stages, food courts, art installations, and interactive experiences, this is more than just a concert - it's a celebration of music, culture, and community.",
        shortDescription: "The biggest music festival of the year",
        category: "CONCERT",
        startDate: "2024-09-15",
        endDate: "2024-09-15",
        startTime: "18:00",
        endTime: "23:00",
        location: "Bandra Kurla Complex",
        city: "Mumbai",
        state: "Maharashtra",
  coverImage: "/assets/sports/football.jpg",
        isFree: false,
        minPrice: 1500,
        maxPrice: 5000,
        currentAttendees: 1200,
        maxAttendees: 5000,
        featured: true,
        trending: true,
        rating: 4.8,
        reviewCount: 156,
        organizer: {
          name: "Mumbai Events Co.",
          email: "info@mumbaievents.com",
          phone: "+91 98765 43210",
          website: "www.mumbaievents.com",
          socialMedia: {
            facebook: "mumbaievents",
            twitter: "mumbaievents",
            instagram: "mumbaievents",
            linkedin: "mumbaievents"
          }
        },
        tickets: [
          {
            id: "t1",
            name: "Early Bird",
            description: "Limited early bird tickets with exclusive access",
            price: 1500,
            available: 200,
            sold: 300,
            benefits: ["VIP seating area", "Exclusive merchandise", "Meet & greet opportunity"]
          },
          {
            id: "t2",
            name: "General Admission",
            description: "Standard festival access",
            price: 2500,
            available: 800,
            sold: 700,
            benefits: ["General seating", "Food vouchers", "Festival kit"]
          },
          {
            id: "t3",
            name: "VIP Experience",
            description: "Premium festival experience with exclusive perks",
            price: 5000,
            available: 100,
            sold: 200,
            benefits: ["Premium seating", "All-inclusive food & drinks", "Artist meet & greet", "Exclusive lounge access"]
          }
        ]
      },
      "2": {
        id: "2",
        title: "Tech Workshop: AI & Machine Learning",
        description: "Learn the fundamentals of AI and ML from industry experts. Hands-on sessions, real-world projects, and networking opportunities with tech professionals. This intensive 3-day workshop covers everything from basic concepts to advanced implementations. You'll work on real projects, get hands-on experience with cutting-edge tools, and build a portfolio of work that will impress employers. Perfect for students, professionals looking to upskill, and anyone interested in the future of technology.",
        shortDescription: "Master AI & ML fundamentals",
        category: "WORKSHOP",
        startDate: "2024-09-20",
        endDate: "2024-09-22",
        startTime: "10:00",
        endTime: "18:00",
        location: "Tech Hub Bangalore",
        city: "Bangalore",
        state: "Karnataka",
  coverImage: "/assets/sports/tennis.jpg",
        isFree: false,
        minPrice: 500,
        maxPrice: 2000,
        currentAttendees: 85,
        maxAttendees: 100,
        featured: true,
        trending: true,
        rating: 4.6,
        reviewCount: 89,
        organizer: {
          name: "Tech Academy India",
          email: "workshops@techacademy.in",
          phone: "+91 87654 32109",
          website: "www.techacademy.in",
          socialMedia: {
            facebook: "techacademyindia",
            twitter: "techacademy_in",
            instagram: "techacademy_india",
            linkedin: "techacademy-india"
          }
        },
        tickets: [
          {
            id: "t1",
            name: "Student Pass",
            description: "Special pricing for students with valid ID",
            price: 500,
            available: 30,
            sold: 20,
            benefits: ["Workshop materials", "Certificate", "Lunch included"]
          },
          {
            id: "t2",
            name: "Professional Pass",
            description: "Standard workshop access for professionals",
            price: 1500,
            available: 40,
            sold: 35,
            benefits: ["Workshop materials", "Certificate", "Lunch included", "Networking dinner"]
          },
          {
            id: "t3",
            name: "Premium Pass",
            description: "Full workshop experience with additional benefits",
            price: 2000,
            available: 30,
            sold: 30,
            benefits: ["Workshop materials", "Certificate", "Lunch & dinner", "Networking events", "1-on-1 mentoring session"]
          }
        ]
      }
    };

    return sampleEvents[eventId] || sampleEvents["1"];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'CONCERT': 'bg-purple-100 text-purple-800',
      'WORKSHOP': 'bg-blue-100 text-blue-800',
      'SPORTS': 'bg-green-100 text-green-800',
      'BUSINESS': 'bg-orange-100 text-orange-800',
      'HACKATHON': 'bg-indigo-100 text-indigo-800',
      'FESTIVAL': 'bg-pink-100 text-pink-800',
      'CONFERENCE': 'bg-red-100 text-red-800',
      'EXHIBITION': 'bg-yellow-100 text-yellow-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const handleBookNow = () => {
    if (!selectedTicket) return;
    // Navigate to booking page or open booking modal
    router.push(`/events/${event?.id}/book?ticket=${selectedTicket}&quantity=${quantity}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <p className="text-gray-600 mb-6">The event you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/events')} className="bg-orange-600 hover:bg-orange-700">
            Browse All Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/events')}
          className="mb-6 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Event Image */}
            <div className="relative mb-6">
              <img
                src={event.coverImage}
                alt={event.title}
                className="w-full h-96 object-cover rounded-2xl"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                {event.featured && (
                  <Badge className="bg-orange-500 text-white">Featured</Badge>
                )}
                {event.trending && (
                  <Badge className="bg-purple-500 text-white">Trending</Badge>
                )}
                <Badge className={getCategoryColor(event.category)}>
                  {event.category}
                </Badge>
              </div>
            </div>

            {/* Event Title and Rating */}
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="text-lg font-semibold">{event.rating}</span>
                  <span className="text-gray-600">({event.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Users className="h-5 w-5" />
                  <span>{event.currentAttendees} attending</span>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">{formatDate(event.startDate)}</p>
                      {event.startDate !== event.endDate && (
                        <p className="text-sm text-gray-600">to {formatDate(event.endDate)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">{formatTime(event.startTime)} - {formatTime(event.endTime)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">{event.location}</p>
                      <p className="text-sm text-gray-600">{event.city}, {event.state}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">{event.currentAttendees} / {event.maxAttendees}</p>
                      <p className="text-sm text-gray-600">attendees</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Description */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{event.description}</p>
              </CardContent>
            </Card>

            {/* Organizer Information */}
            {event.organizer && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-xl">Organizer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-lg mb-2">{event.organizer.name}</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span>{event.organizer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{event.organizer.phone}</span>
                        </div>
                        {event.organizer.website && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Globe className="h-4 w-4" />
                            <a href={event.organizer.website} className="text-orange-600 hover:underline">
                              {event.organizer.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {event.organizer.socialMedia && (
                      <div>
                        <p className="font-medium mb-2">Follow us:</p>
                        <div className="flex gap-3">
                          {event.organizer.socialMedia.facebook && (
                            <a href={`https://facebook.com/${event.organizer.socialMedia.facebook}`} 
                               className="text-blue-600 hover:text-blue-700">
                              <Facebook className="h-5 w-5" />
                            </a>
                          )}
                          {event.organizer.socialMedia.twitter && (
                            <a href={`https://twitter.com/${event.organizer.socialMedia.twitter}`} 
                               className="text-blue-400 hover:text-blue-500">
                              <Twitter className="h-5 w-5" />
                            </a>
                          )}
                          {event.organizer.socialMedia.instagram && (
                            <a href={`https://instagram.com/${event.organizer.socialMedia.instagram}`} 
                               className="text-pink-600 hover:text-pink-700">
                              <Instagram className="h-5 w-5" />
                            </a>
                          )}
                          {event.organizer.socialMedia.linkedin && (
                            <a href={`https://linkedin.com/company/${event.organizer.socialMedia.linkedin}`} 
                               className="text-blue-700 hover:text-blue-800">
                              <Linkedin className="h-5 w-5" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-xl">Book Your Spot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.tickets && event.tickets.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {event.tickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                            selectedTicket === ticket.id
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedTicket(ticket.id)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold">{ticket.name}</h4>
                              <p className="text-sm text-gray-600">{ticket.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">
                                {ticket.price === 0 ? 'Free' : `₹${ticket.price}`}
                              </p>
                              <p className="text-xs text-gray-500">
                                {ticket.available} available
                              </p>
                            </div>
                          </div>
                          {ticket.benefits.length > 0 && (
                            <ul className="text-sm text-gray-600 space-y-1">
                              {ticket.benefits.map((benefit, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>

                    {selectedTicket && (
                      <>
                        <Separator />
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="font-medium">Quantity:</label>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity <= 1}
                              >
                                -
                              </Button>
                              <span className="w-8 text-center">{quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setQuantity(quantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                          
                          <Button
                            onClick={handleBookNow}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3"
                          >
                            <Ticket className="h-5 w-5 mr-2" />
                            Book Now
                          </Button>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">Tickets not available yet</p>
                    <Button variant="outline" className="w-full">
                      <Heart className="h-4 w-4 mr-2" />
                      Save Event
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Share Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Share Event</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Event
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
