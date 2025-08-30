import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  MapPin,
  BarChart3,
  Settings,
  Shield,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";

const AdminPage = () => {
  const quickActions = [
    {
      title: "Dashboard",
      description: "View platform overview and analytics",
      href: "/admin/dashboard",
      icon: BarChart3,
      color: "bg-blue-500"
    },
    {
      title: "User Management",
      description: "Manage users, roles, and permissions",
      href: "/admin/users",
      icon: Users,
      color: "bg-green-500"
    },
    {
      title: "Event Management",
      description: "Review and manage events",
      href: "/admin/events",
      icon: Calendar,
      color: "bg-purple-500"
    },
    {
      title: "Venue Management",
      description: "Manage venues and facilities",
      href: "/admin/venues",
      icon: MapPin,
      color: "bg-orange-500"
    },
    {
      title: "Reports & Analytics",
      description: "Generate reports and view insights",
      href: "/admin/reports",
      icon: BarChart3,
      color: "bg-indigo-500"
    },
    {
      title: "Platform Settings",
      description: "Configure system settings",
      href: "/admin/settings",
      icon: Settings,
      color: "bg-gray-500"
    }
  ];

  const recentActivity = [
    {
      action: "New user registration",
      user: "new.user@example.com",
      time: "2 minutes ago",
      type: "info"
    },
    {
      action: "Event approval required",
      user: "Tech Conference 2024",
      time: "15 minutes ago",
      type: "warning"
    },
    {
      action: "Venue added",
      user: "Stadium Complex",
      time: "1 hour ago",
      type: "success"
    },
    {
      action: "Payment processed",
      user: "₹25,000",
      time: "2 hours ago",
      type: "success"
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "success":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      default:
        return <Shield className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">EventHive Admin</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Welcome to the EventHive administration panel. Manage your platform, users, events, and venues from one central location.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className={`${action.color} p-3 rounded-lg text-white`}>
                        <action.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {action.description}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50">
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.user}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link href="/admin/activity">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Activity
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">API Status</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Database</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Online</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Payment Gateway</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium">Email Service</span>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Link href="/admin/system">
                  <Button variant="outline" size="sm" className="w-full">
                    View System Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Platform Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">12,847</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Calendar className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">1,234</p>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">89</p>
                  <p className="text-sm text-muted-foreground">Active Venues</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">₹45.2L</p>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
