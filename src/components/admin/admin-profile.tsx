"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit3,
  Save,
  X,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

interface AdminProfileData {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    bio?: string;
    address?: string;
    dateOfBirth?: Date;
    gender?: string;
    website?: string;
    linkedIn?: string;
    twitter?: string;
    image?: string;
    createdAt: Date;
  };
  role: string;
  phoneNumber?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AdminProfileProps {
  profile: AdminProfileData;
}

export function AdminProfile({ profile }: AdminProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.user.name,
    bio: profile.user.bio || "",
    address: profile.user.address || "",
    phoneNumber: profile.phoneNumber || "",
    website: profile.user.website || "",
    linkedIn: profile.user.linkedIn || "",
    twitter: profile.user.twitter || "",
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Here you would call an API endpoint to update the profile
      // For now, we'll just simulate a save
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile.user.name,
      bio: profile.user.bio || "",
      address: profile.user.address || "",
      phoneNumber: profile.phoneNumber || "",
      website: profile.user.website || "",
      linkedIn: profile.user.linkedIn || "",
      twitter: profile.user.twitter || "",
    });
    setIsEditing(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Shield className="h-8 w-8 text-blue-600" />
            Admin Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your admin account information and settings
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Overview */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={profile.user.image || profile.avatar}
                  alt={profile.user.name}
                />
                <AvatarFallback className="text-lg">
                  {getInitials(profile.user.name)}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Change Photo
                </Button>
              )}
            </div>

            <div className="space-y-3">
              <div className="text-center">
                <h3 className="text-lg font-semibold">{profile.user.name}</h3>
                <p className="text-muted-foreground">{profile.user.email}</p>
              </div>

              <div className="flex justify-center">
                <Badge className="bg-blue-100 text-blue-800">
                  <Shield className="mr-1 h-3 w-3" />
                  {profile.role}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <span>Joined {formatDate(profile.user.createdAt)}</span>
                </div>
                {profile.phoneNumber && (
                  <div className="flex items-center space-x-2">
                    <Phone className="text-muted-foreground h-4 w-4" />
                    <span>{profile.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                ) : (
                  <p className="text-sm">{profile.user.name}</p>
                )}
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center space-x-2">
                  <Mail className="text-muted-foreground h-4 w-4" />
                  <p className="text-sm">{profile.user.email}</p>
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phoneNumber: e.target.value,
                      }))
                    }
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="text-sm">
                    {profile.phoneNumber || "Not provided"}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                {isEditing ? (
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    placeholder="Enter address"
                  />
                ) : (
                  <p className="text-sm">
                    {profile.user.address || "Not provided"}
                  </p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              ) : (
                <p className="text-sm">
                  {profile.user.bio || "No bio provided"}
                </p>
              )}
            </div>

            <Separator />

            {/* Social Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Social Links</h4>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  {isEditing ? (
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          website: e.target.value,
                        }))
                      }
                      placeholder="https://example.com"
                    />
                  ) : (
                    <p className="text-sm">
                      {profile.user.website ? (
                        <a
                          href={profile.user.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {profile.user.website}
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </p>
                  )}
                </div>

                {/* LinkedIn */}
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  {isEditing ? (
                    <Input
                      id="linkedin"
                      value={formData.linkedIn}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          linkedIn: e.target.value,
                        }))
                      }
                      placeholder="LinkedIn profile URL"
                    />
                  ) : (
                    <p className="text-sm">
                      {profile.user.linkedIn ? (
                        <a
                          href={profile.user.linkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          LinkedIn Profile
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </p>
                  )}
                </div>

                {/* Twitter */}
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  {isEditing ? (
                    <Input
                      id="twitter"
                      value={formData.twitter}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          twitter: e.target.value,
                        }))
                      }
                      placeholder="Twitter profile URL"
                    />
                  ) : (
                    <p className="text-sm">
                      {profile.user.twitter ? (
                        <a
                          href={profile.user.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Twitter Profile
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Role</Label>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">{profile.role}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Account Created</Label>
              <p className="text-sm">{formatDate(profile.user.createdAt)}</p>
            </div>
            <div className="space-y-2">
              <Label>Last Updated</Label>
              <p className="text-sm">{formatDate(profile.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
