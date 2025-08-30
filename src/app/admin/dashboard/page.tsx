import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  DollarSign,
  MapPin
} from "lucide-react";
import Link from "next/link";

const AdminDashboardPage = () => {
  const stats = [
    {
      title: "Total Users",
      value: "12,847",
      change: "+12%",
      changeType: "positive",
      icon: Users,
      description: "from last month"
    },
    {
      title: "Total Events",
      value: "1,234",
      change: "+8%",
      changeType: "positive",
      icon: Calendar,
      description: "from last month"
    },
    {
      title: "Revenue",
      value: "₹45.2L",
      change: "+23%",
      changeType: "positive",
      icon: DollarSign,
      description: "from last month"
    },
    {
      title: "Active Venues",
      value: "89",
      change: "+5%",
      changeType: "positive",
      icon: MapPin,
      description: "from last month"
    }
  ];

  const recentEvents = [
    {
      id: 1,
      title: "Tech Conference 2024",
      organizer: "TechCorp India",
      date: "2024-03-15",
      status: "approved",
      attendees: 450,
      revenue: "₹2.5L"
    },
    {
      id: 2,
      title: "Music Festival",
      organizer: "EventPro",
      date: "2024-03-20",
      status: "pending",
      attendees: 1200,
      revenue: "₹8.0L"
    },
    {
      id: 3,
      title: "Sports Tournament",
      organizer: "SportsHub",
      date: "2024-03-25",
      status: "approved",
      attendees: 300,
      revenue: "₹1.2L"
    },
    {
      id: 4,
      title: "Business Summit",
      organizer: "BusinessEvents",
      date: "2024-04-01",
      status: "rejected",
      attendees: 200,
      revenue: "₹3.0L"
    }
  ];

  const pendingApprovals = [
    {
      id: 1,
      type: "Event",
      title: "Art Exhibition",
      organizer: "ArtGallery",
      submitted: "2 hours ago",
      priority: "high"
    },
    {
      id: 2,
      type: "Venue",
      title: "New Stadium Complex",
      organizer: "StadiumCorp",
      submitted: "4 hours ago",
      priority: "medium"
    },
    {
      id: 3,
      type: "Event",
      title: "Food Festival",
      organizer: "FoodEvents",
      submitted: "6 hours ago",
      priority: "low"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Monitor and manage EventHive platform</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Admin
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="mt-2">
                  <Badge variant="secondary" className={stat.changeType === "positive" ? "text-green-600" : "text-red-600"}>
                    {stat.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Events */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Events</CardTitle>
                  <Link href="/admin/events">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium">{event.title}</h3>
                          <Badge className={getStatusColor(event.status)}>
                            {event.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{event.organizer}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>📅 {event.date}</span>
                          <span>👥 {event.attendees}</span>
                          <span>💰 {event.revenue}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Pending Approvals */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingApprovals.map((item) => (
                    <div key={item.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{item.type}</Badge>
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.organizer}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.submitted}</p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" className="flex-1">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin/users">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Users
                  </Button>
                </Link>
                <Link href="/admin/venues">
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="w-4 h-4 mr-2" />
                    Manage Venues
                  </Button>
                </Link>
                <Link href="/admin/reports">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Reports
                  </Button>
                </Link>
                <Link href="/admin/settings">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="w-4 h-4 mr-2" />
                    Platform Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Status</span>
                  <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge className="bg-green-100 text-green-800">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Payment Gateway</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Service</span>
                  <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
