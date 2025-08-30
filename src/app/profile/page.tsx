"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Edit, Save, X, Plus } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    dateOfBirth: "",
    favoriteCategories: [] as string[],
    interests: [] as string[],
    image: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: session } = await authClient.getSession();
        if (!session?.user) {
          // Redirect to login
          window.location.href = "/auth/login?redirect=/profile";
          return;
        }

        const res = await fetch("/api/profile", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load profile");
        const p = await res.json();

        const nameParts = (p.name || "").split(" ");
        const firstName = nameParts.shift() ?? "";
        const lastName = nameParts.join(" ");

        setProfileData({
          firstName,
          lastName,
          email: p.email || "",
          phone: p.phoneNumber || "",
          bio: p.bio || "",
          location: p.address || "",
          dateOfBirth: p.dateOfBirth ? p.dateOfBirth.substring(0, 10) : "",
          favoriteCategories: p.favoriteCategories || [],
          interests: p.interests || [],
          image: p.image || "",
        });
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const [newInterest, setNewInterest] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const categories = [
    "WORKSHOP", "CONCERT", "SPORTS", "HACKATHON", "BUSINESS", 
    "CONFERENCE", "EXHIBITION", "FESTIVAL", "SEMINAR", "WEBINAR", "MEETUP"
  ];

  const handleSave = () => {
    setIsEditing(false);
    // Handle profile update
    console.log("Profile updated:", profileData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !profileData.interests.includes(newInterest.trim())) {
      setProfileData({
        ...profileData,
        interests: [...profileData.interests, newInterest.trim()]
      });
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setProfileData({
      ...profileData,
      interests: profileData.interests.filter(interest => interest !== interestToRemove)
    });
  };

  const handleAddCategory = () => {
    if (newCategory && !profileData.favoriteCategories.includes(newCategory)) {
      setProfileData({
        ...profileData,
        favoriteCategories: [...profileData.favoriteCategories, newCategory]
      });
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setProfileData({
      ...profileData,
      favoriteCategories: profileData.favoriteCategories.filter(category => category !== categoryToRemove)
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-orange-600"></div>
          <p className="text-sm text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profile</h1>
            <p className="text-muted-foreground">Manage your personal information and preferences</p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profileData.image || "/placeholder-avatar.jpg"} alt="Profile" />
                    <AvatarFallback className="text-2xl">
                      {(profileData.firstName?.[0] || "?")}{(profileData.lastName?.[0] || "?")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center sm:text-left flex-1">
                    <h2 className="text-2xl font-bold text-foreground">
                      {profileData.firstName || "Your"} {profileData.lastName || "Name"}
                    </h2>
                    <p className="text-muted-foreground mb-2">{profileData.email || ""}</p>
                    <p className="text-sm text-muted-foreground mb-3">{profileData.bio}</p>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      {profileData.favoriteCategories.map((category) => (
                        <Badge key={category} variant="secondary">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interests */}
            <Card>
              <CardHeader>
                <CardTitle>Interests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add new interest"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                    />
                    <Button onClick={handleAddInterest} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {profileData.interests.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {interest}
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveInterest(interest)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Favorite Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Favorite Event Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing && (
                  <div className="flex gap-2">
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <Button onClick={handleAddCategory} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {profileData.favoriteCategories.map((category) => (
                    <Badge key={category} variant="default" className="flex items-center gap-1">
                      {category}
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveCategory(category)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Events Attended</span>
                    <span className="font-semibold">24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Events Created</span>
                    <span className="font-semibold">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Reviews Written</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Member Since</span>
                    <span className="font-semibold">2022</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p className="font-medium">Attended Tech Workshop</p>
                    <p className="text-muted-foreground text-xs">2 days ago</p>
                  </div>
                  <Separator />
                  <div className="text-sm">
                    <p className="font-medium">Created Music Festival</p>
                    <p className="text-muted-foreground text-xs">1 week ago</p>
                  </div>
                  <Separator />
                  <div className="text-sm">
                    <p className="font-medium">Wrote venue review</p>
                    <p className="text-muted-foreground text-xs">2 weeks ago</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
