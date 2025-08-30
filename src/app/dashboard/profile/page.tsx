"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Save,
  X,
  Building2,
  Star,
  Globe,
  Linkedin,
  Twitter,
  Users,
  Cake,
} from "lucide-react";
import { toast } from "sonner";

// Profile form schema
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phoneNumber: z.string().optional(),
  bio: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  linkedIn: z.string().optional(),
  twitter: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  phoneNumber?: string;
  bio?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  website?: string;
  linkedIn?: string;
  twitter?: string;
  createdAt: string;
  role: string;
  facilityOwner?: {
    id: string;
    businessName?: string;
    businessLicense?: string;
    contactNumber?: string;
    facilities: Array<{
      id: string;
      name: string;
      address: string;
      rating: number;
      courts: Array<{
        id: string;
        name: string;
        sportType: string;
      }>;
    }>;
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      bio: "",
      address: "",
      dateOfBirth: "",
      gender: "",
      website: "",
      linkedIn: "",
      twitter: "",
    },
  });

  useEffect(() => {
    void loadProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || "",
        email: profile.email || "",
        phoneNumber: profile.phoneNumber || "",
        bio: profile.bio || "",
        address: profile.address || "",
        dateOfBirth: profile.dateOfBirth || "",
        gender: profile.gender || "",
        website: profile.website || "",
        linkedIn: profile.linkedIn || "",
        twitter: profile.twitter || "",
      });
    }
  }, [profile, form]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/profile");
      if (!response.ok) {
        throw new Error("Failed to load profile");
      }
      const profileData = await response.json();
      setProfile(profileData);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setSaving(true);
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const result = await response.json();

      // Update the profile state with the returned user data
      setProfile((prevProfile) => {
        if (!prevProfile) return null;
        return {
          ...prevProfile,
          ...result.user,
          createdAt: prevProfile.createdAt, // Keep original createdAt
        };
      });

      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      form.reset({
        name: profile.name || "",
        email: profile.email || "",
        phoneNumber: profile.phoneNumber || "",
        bio: profile.bio || "",
        address: profile.address || "",
        dateOfBirth: profile.dateOfBirth || "",
        gender: profile.gender || "",
        website: profile.website || "",
        linkedIn: profile.linkedIn || "",
        twitter: profile.twitter || "",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p className="text-muted-foreground mt-2">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load profile</p>
          <Button onClick={loadProfile} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and business details
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="gap-2">
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={saving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Personal Information */}
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Form {...form}>
                  <form className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your full name"
                                {...field}
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
                                type="email"
                                placeholder="Enter your email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your phone number"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="">Select gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                              <option value="prefer-not-to-say">
                                Prefer not to say
                              </option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about yourself"
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter your address"
                              className="resize-none"
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Social Links</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://yourwebsite.com"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="linkedIn"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>LinkedIn</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="linkedin.com/in/yourprofile"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="twitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Twitter</FormLabel>
                            <FormControl>
                              <Input placeholder="@yourusername" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-3">
                      <User className="text-muted-foreground h-4 w-4" />
                      <div>
                        <p className="font-medium">{profile.name}</p>
                        <p className="text-muted-foreground text-sm">
                          Full Name
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="text-muted-foreground h-4 w-4" />
                      <div>
                        <p className="font-medium">{profile.email}</p>
                        <p className="text-muted-foreground text-sm">Email</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {profile.phoneNumber && (
                      <div className="flex items-center gap-3">
                        <Phone className="text-muted-foreground h-4 w-4" />
                        <div>
                          <p className="font-medium">{profile.phoneNumber}</p>
                          <p className="text-muted-foreground text-sm">Phone</p>
                        </div>
                      </div>
                    )}

                    {profile.dateOfBirth && (
                      <div className="flex items-center gap-3">
                        <Cake className="text-muted-foreground h-4 w-4" />
                        <div>
                          <p className="font-medium">
                            {new Date(profile.dateOfBirth).toLocaleDateString()}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            Date of Birth
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {profile.gender && (
                    <div className="flex items-center gap-3">
                      <Users className="text-muted-foreground h-4 w-4" />
                      <div>
                        <p className="font-medium capitalize">
                          {profile.gender.replace("-", " ")}
                        </p>
                        <p className="text-muted-foreground text-sm">Gender</p>
                      </div>
                    </div>
                  )}

                  {profile.bio && (
                    <div className="flex items-start gap-3">
                      <User className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <div>
                        <p className="font-medium">{profile.bio}</p>
                        <p className="text-muted-foreground text-sm">Bio</p>
                      </div>
                    </div>
                  )}

                  {profile.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <div>
                        <p className="font-medium">{profile.address}</p>
                        <p className="text-muted-foreground text-sm">Address</p>
                      </div>
                    </div>
                  )}

                  {(profile.website || profile.linkedIn || profile.twitter) && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Social Links</h4>
                      <div className="space-y-3">
                        {profile.website && (
                          <div className="flex items-center gap-3">
                            <Globe className="text-muted-foreground h-4 w-4" />
                            <div>
                              <a
                                href={profile.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-blue-600 hover:underline"
                              >
                                {profile.website}
                              </a>
                              <p className="text-muted-foreground text-sm">
                                Website
                              </p>
                            </div>
                          </div>
                        )}

                        {profile.linkedIn && (
                          <div className="flex items-center gap-3">
                            <Linkedin className="text-muted-foreground h-4 w-4" />
                            <div>
                              <a
                                href={`https://${profile.linkedIn}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-blue-600 hover:underline"
                              >
                                {profile.linkedIn}
                              </a>
                              <p className="text-muted-foreground text-sm">
                                LinkedIn
                              </p>
                            </div>
                          </div>
                        )}

                        {profile.twitter && (
                          <div className="flex items-center gap-3">
                            <Twitter className="text-muted-foreground h-4 w-4" />
                            <div>
                              <a
                                href={`https://twitter.com/${profile.twitter.replace("@", "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-blue-600 hover:underline"
                              >
                                {profile.twitter}
                              </a>
                              <p className="text-muted-foreground text-sm">
                                Twitter
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Facility Owner Information */}
          {profile.facilityOwner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.facilityOwner.businessName && (
                  <div className="flex items-center gap-3">
                    <Building2 className="text-muted-foreground h-4 w-4" />
                    <div>
                      <p className="font-medium">
                        {profile.facilityOwner.businessName}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Business Name
                      </p>
                    </div>
                  </div>
                )}

                {profile.facilityOwner.contactNumber && (
                  <div className="flex items-center gap-3">
                    <Phone className="text-muted-foreground h-4 w-4" />
                    <div>
                      <p className="font-medium">
                        {profile.facilityOwner.contactNumber}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Business Contact
                      </p>
                    </div>
                  </div>
                )}

                {profile.facilityOwner.businessLicense && (
                  <div className="flex items-center gap-3">
                    <Building2 className="text-muted-foreground h-4 w-4" />
                    <div>
                      <p className="font-medium">
                        {profile.facilityOwner.businessLicense}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Business License
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">User ID</span>
                <code className="bg-muted rounded px-2 py-1 text-xs">
                  {profile.id.slice(0, 8)}...
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Role</span>
                <Badge variant="secondary">{profile.role}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Status</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Member Since
                </span>
                <span className="text-sm font-medium">
                  {new Date(profile.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              {profile.facilityOwner && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Facilities
                  </span>
                  <Badge variant="outline">
                    {profile.facilityOwner.facilities.length}{" "}
                    {profile.facilityOwner.facilities.length === 1
                      ? "Facility"
                      : "Facilities"}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Facilities Overview */}
          {profile.facilityOwner &&
            profile.facilityOwner.facilities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Your Facilities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.facilityOwner.facilities.map((facility) => (
                    <div
                      key={facility.id}
                      className="space-y-2 rounded-lg border p-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{facility.name}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current text-yellow-500" />
                          <span className="text-xs">
                            {facility.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <p className="text-muted-foreground flex items-center gap-1 text-xs">
                        <MapPin className="h-3 w-3" />
                        {facility.address}
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground text-xs">
                          {facility.courts.length} courts
                        </span>
                        <span className="text-muted-foreground text-xs">•</span>
                        <span className="text-muted-foreground text-xs">
                          {facility.courts.map((c) => c.sportType).join(", ")}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
        </div>
      </div>
    </div>
  );
}
