"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus, MapPin } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  createFacility,
  updateFacility,
  type CreateFacilityData,
  type UpdateFacilityData,
} from "@/actions/facility-actions";

const facilitySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  address: z.string().min(5, "Address must be at least 5 characters"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  venueType: z.enum(["INDOOR", "OUTDOOR", "MIXED"]),
  amenities: z.array(z.string()).default([]),
  policies: z.array(z.string()).default([]),
  photos: z.array(z.string()).default([]),
});

type FacilityFormData = z.infer<typeof facilitySchema>;

interface FacilityFormProps {
  initialData?: Partial<FacilityFormData & { id: string }>;
  isEditing?: boolean;
}

const commonAmenities = [
  "Parking",
  "Restrooms",
  "Changing Rooms",
  "Showers",
  "Lockers",
  "Equipment Rental",
  "Pro Shop",
  "Café/Restaurant",
  "Air Conditioning",
  "Wi-Fi",
  "First Aid",
  "Spectator Seating",
  "Lighting",
  "Sound System",
  "Scoreboard",
];

const commonPolicies = [
  "No smoking",
  "Proper sports attire required",
  "Clean indoor shoes only",
  "No outside food or drinks",
  "Children must be supervised",
  "24-hour cancellation policy",
  "No refunds for bad weather (outdoor courts)",
  "Equipment must be returned in good condition",
  "Maximum 2-hour booking slots",
  "Payment required in advance",
];

export function FacilityForm({
  initialData,
  isEditing = false,
}: FacilityFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [newAmenity, setNewAmenity] = useState("");
  const [newPolicy, setNewPolicy] = useState("");

  const form = useForm<FacilityFormData>({
    resolver: zodResolver(facilitySchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      address: initialData?.address || "",
      latitude: initialData?.latitude,
      longitude: initialData?.longitude,
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      venueType: initialData?.venueType || "INDOOR",
      amenities: initialData?.amenities || [],
      policies: initialData?.policies || [],
      photos: initialData?.photos || [],
    },
  });

  const onSubmit = async (data: FacilityFormData) => {
    try {
      setLoading(true);

      if (isEditing && initialData?.id) {
        await updateFacility({
          ...data,
          id: initialData.id,
        } as UpdateFacilityData);
        toast.success("Facility updated successfully");
        router.push(`/dashboard/facilities/${initialData.id}`);
      } else {
        const result = await createFacility(data as CreateFacilityData);
        toast.success("Facility created successfully");
        router.push(`/dashboard/facilities/${result.id}`);
      }
    } catch (error) {
      console.error("Error saving facility:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save facility",
      );
    } finally {
      setLoading(false);
    }
  };

  const addAmenity = (amenity: string) => {
    const currentAmenities = form.getValues("amenities");
    if (!currentAmenities.includes(amenity)) {
      form.setValue("amenities", [...currentAmenities, amenity]);
    }
    setNewAmenity("");
  };

  const removeAmenity = (amenity: string) => {
    const currentAmenities = form.getValues("amenities");
    form.setValue(
      "amenities",
      currentAmenities.filter((a) => a !== amenity),
    );
  };

  const addPolicy = (policy: string) => {
    const currentPolicies = form.getValues("policies");
    if (!currentPolicies.includes(policy)) {
      form.setValue("policies", [...currentPolicies, policy]);
    }
    setNewPolicy("");
  };

  const removePolicy = (policy: string) => {
    const currentPolicies = form.getValues("policies");
    form.setValue(
      "policies",
      currentPolicies.filter((p) => p !== policy),
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential details about your facility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facility Name</FormLabel>
                    <FormControl>
                      <Input
                        value={field.value || ""}
                        placeholder="Enter facility name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your facility..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="venueType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select venue type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INDOOR">Indoor</SelectItem>
                        <SelectItem value="OUTDOOR">Outdoor</SelectItem>
                        <SelectItem value="MIXED">
                          Mixed (Indoor & Outdoor)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Facility Photos */}
          <Card>
            <CardHeader>
              <CardTitle>Facility Photos</CardTitle>
              <CardDescription>
                Upload up to {5} photos. JPEG, PNG, or WebP. Max 5MB each.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="photos"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageUpload
                        onImagesChange={field.onChange}
                        initialImages={field.value}
                        maxImages={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Location & Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Location & Contact</CardTitle>
              <CardDescription>Address and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                        <Textarea
                          placeholder="Enter full address..."
                          className="min-h-[80px] pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="0.000000"
                          value={field.value ?? ""}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="0.000000"
                          value={field.value ?? ""}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+1 (555) 123-4567"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="facility@example.com"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
            <CardDescription>
              Select available amenities at your facility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Common Amenities */}
            <div>
              <h4 className="mb-3 text-sm font-medium">Common Amenities</h4>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {commonAmenities.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={`amenity-${amenity}`}
                      checked={form.watch("amenities").includes(amenity)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          addAmenity(amenity);
                        } else {
                          removeAmenity(amenity);
                        }
                      }}
                    />
                    <label
                      htmlFor={`amenity-${amenity}`}
                      className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {amenity}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Amenity */}
            <div className="flex gap-2">
              <Input
                placeholder="Add custom amenity..."
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (newAmenity.trim()) {
                      addAmenity(newAmenity.trim());
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (newAmenity.trim()) {
                    addAmenity(newAmenity.trim());
                  }
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Selected Amenities */}
            {form.watch("amenities").length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium">Selected Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {form.watch("amenities").map((amenity) => (
                    <Badge key={amenity} variant="secondary" className="pr-1">
                      {amenity}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-1"
                        onClick={() => removeAmenity(amenity)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Policies */}
        <Card>
          <CardHeader>
            <CardTitle>Policies & Rules</CardTitle>
            <CardDescription>
              Set rules and policies for your facility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Common Policies */}
            <div>
              <h4 className="mb-3 text-sm font-medium">Common Policies</h4>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {commonPolicies.map((policy) => (
                  <div key={policy} className="flex items-center space-x-2">
                    <Checkbox
                      id={`policy-${policy}`}
                      checked={form.watch("policies").includes(policy)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          addPolicy(policy);
                        } else {
                          removePolicy(policy);
                        }
                      }}
                    />
                    <label
                      htmlFor={`policy-${policy}`}
                      className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {policy}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Policy */}
            <div className="flex gap-2">
              <Input
                placeholder="Add custom policy..."
                value={newPolicy}
                onChange={(e) => setNewPolicy(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (newPolicy.trim()) {
                      addPolicy(newPolicy.trim());
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (newPolicy.trim()) {
                    addPolicy(newPolicy.trim());
                  }
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Selected Policies */}
            {form.watch("policies").length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium">Selected Policies</h4>
                <div className="flex flex-wrap gap-2">
                  {form.watch("policies").map((policy) => (
                    <Badge key={policy} variant="secondary" className="pr-1">
                      {policy}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-1"
                        onClick={() => removePolicy(policy)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : isEditing
                ? "Update Facility"
                : "Create Facility"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
