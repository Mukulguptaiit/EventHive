"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar, MapPin, Clock, Users, Image as ImageIcon, Plus, X } from "lucide-react";

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    location: "",
    city: "",
    state: "",
    maxAttendees: "",
    isFree: false,
    minPrice: "",
    maxPrice: "",
    coverImage: "",
    featured: false,
    trending: false
  });

  const [tickets, setTickets] = useState([
    {
      id: "1",
      name: "",
      description: "",
      price: "",
      quantity: "",
      benefits: [""]
    }
  ]);

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
    { value: "OTHER", label: "Other" }
  ];

  const cities = [
    "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", 
    "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Surat"
  ];

  const states = [
    "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "West Bengal",
    "Telangana", "Gujarat", "Rajasthan", "Uttar Pradesh", "Bihar"
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTicketChange = (index: number, field: string, value: string) => {
    const newTickets = [...tickets];
    newTickets[index] = {
      ...newTickets[index],
      [field]: value
    };
    setTickets(newTickets);
  };

  const handleBenefitChange = (ticketIndex: number, benefitIndex: number, value: string) => {
    const newTickets = [...tickets];
    newTickets[ticketIndex].benefits[benefitIndex] = value;
    setTickets(newTickets);
  };

  const addBenefit = (ticketIndex: number) => {
    const newTickets = [...tickets];
    newTickets[ticketIndex].benefits.push("");
    setTickets(newTickets);
  };

  const removeBenefit = (ticketIndex: number, benefitIndex: number) => {
    const newTickets = [...tickets];
    newTickets[ticketIndex].benefits.splice(benefitIndex, 1);
    setTickets(newTickets);
  };

  const addTicket = () => {
    setTickets([
      ...tickets,
      {
        id: (tickets.length + 1).toString(),
        name: "",
        description: "",
        price: "",
        quantity: "",
        benefits: [""]
      }
    ]);
  };

  const removeTicket = (index: number) => {
    if (tickets.length > 1) {
      setTickets(tickets.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      if (!formData.title || !formData.description || !formData.category || 
          !formData.startDate || !formData.startTime || !formData.location || 
          !formData.city || !formData.state) {
        alert("Please fill in all required fields");
        setLoading(false);
        return;
      }

      // Validate tickets
      for (const ticket of tickets) {
        if (!ticket.name || !ticket.price || !ticket.quantity) {
          alert("Please fill in all ticket details");
          setLoading(false);
          return;
        }
      }

      // Prepare event data
      const eventData = {
        ...formData,
        tickets: tickets.map(ticket => ({
          ...ticket,
          price: parseFloat(ticket.price),
          quantity: parseInt(ticket.quantity),
          benefits: ticket.benefits.filter(b => b.trim() !== "")
        }))
      };

      // In a real app, this would be an API call
      console.log("Creating event:", eventData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to events page
      router.push('/events');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Event</h1>
          <p className="text-gray-600">Share your event with the world and connect with attendees</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter event title"
                    className="mt-2"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Event Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe your event in detail"
                    className="mt-2 min-h-[120px]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select category" />
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

                <div>
                  <Label htmlFor="maxAttendees">Maximum Attendees</Label>
                  <Input
                    id="maxAttendees"
                    type="number"
                    value={formData.maxAttendees}
                    onChange={(e) => handleInputChange("maxAttendees", e.target.value)}
                    placeholder="e.g., 100"
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date and Time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Date and Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange("startTime", e.target.value)}
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange("endTime", e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="location">Venue/Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="e.g., Conference Center"
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="city">City *</Label>
                  <Select value={formData.city} onValueChange={(value) => handleInputChange("city", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="state">State *</Label>
                  <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isFree"
                  checked={formData.isFree}
                  onCheckedChange={(checked) => handleInputChange("isFree", checked)}
                />
                <Label htmlFor="isFree">This is a free event</Label>
              </div>

              {!formData.isFree && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="minPrice">Minimum Price (₹)</Label>
                    <Input
                      id="minPrice"
                      type="number"
                      value={formData.minPrice}
                      onChange={(e) => handleInputChange("minPrice", e.target.value)}
                      placeholder="0"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxPrice">Maximum Price (₹)</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      value={formData.maxPrice}
                      onChange={(e) => handleInputChange("maxPrice", e.target.value)}
                      placeholder="0"
                      className="mt-2"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tickets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Tickets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {tickets.map((ticket, ticketIndex) => (
                <div key={ticket.id} className="border rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Ticket {ticketIndex + 1}</h4>
                    {tickets.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTicket(ticketIndex)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`ticket-name-${ticketIndex}`}>Ticket Name *</Label>
                      <Input
                        id={`ticket-name-${ticketIndex}`}
                        value={ticket.name}
                        onChange={(e) => handleTicketChange(ticketIndex, "name", e.target.value)}
                        placeholder="e.g., Early Bird, VIP"
                        className="mt-2"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor={`ticket-price-${ticketIndex}`}>Price (₹) *</Label>
                      <Input
                        id={`ticket-price-${ticketIndex}`}
                        type="number"
                        value={ticket.price}
                        onChange={(e) => handleTicketChange(ticketIndex, "price", e.target.value)}
                        placeholder="0"
                        className="mt-2"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor={`ticket-quantity-${ticketIndex}`}>Quantity Available *</Label>
                      <Input
                        id={`ticket-quantity-${ticketIndex}`}
                        type="number"
                        value={ticket.quantity}
                        onChange={(e) => handleTicketChange(ticketIndex, "quantity", e.target.value)}
                        placeholder="e.g., 100"
                        className="mt-2"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor={`ticket-description-${ticketIndex}`}>Description</Label>
                      <Input
                        id={`ticket-description-${ticketIndex}`}
                        value={ticket.description}
                        onChange={(e) => handleTicketChange(ticketIndex, "description", e.target.value)}
                        placeholder="Brief description of this ticket"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Benefits/Features</Label>
                    <div className="space-y-2 mt-2">
                      {ticket.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex gap-2">
                          <Input
                            value={benefit}
                            onChange={(e) => handleBenefitChange(ticketIndex, benefitIndex, e.target.value)}
                            placeholder="e.g., VIP seating, Free food"
                            className="flex-1"
                          />
                          {ticket.benefits.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeBenefit(ticketIndex, benefitIndex)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addBenefit(ticketIndex)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Benefit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addTicket}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Ticket Type
              </Button>
            </CardContent>
          </Card>

          {/* Additional Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Additional Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleInputChange("featured", checked)}
                />
                <Label htmlFor="featured">Feature this event on the homepage</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="trending"
                  checked={formData.trending}
                  onCheckedChange={(checked) => handleInputChange("trending", checked)}
                />
                <Label htmlFor="trending">Mark as trending</Label>
              </div>

              <div>
                <Label htmlFor="coverImage">Cover Image URL</Label>
                <Input
                  id="coverImage"
                  value={formData.coverImage}
                  onChange={(e) => handleInputChange("coverImage", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3"
            >
              {loading ? "Creating Event..." : "Create Event"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
