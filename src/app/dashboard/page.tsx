import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import Link from "next/link";

const DashboardPage = () => {
  // Mock data - in real app this would come from API
  const stats = {
    totalEvents: 12,
    activeEvents: 8,
    totalAttendees: 2847,
    totalRevenue: 125000,
    eventsThisMonth: 3,
    revenueThisMonth: 45000,
    eventsLastMonth: 2,
    revenueLastMonth: 32000
  };

  const recentEvents = [
    {
      id: "1",
      title: "Summer Music Festival 2024",
      date: "2024-09-15",
      attendees: 1200,
      revenue: 45000,
      status: "active"
    },
    {
      id: "2",
      title: "Tech Workshop: AI & ML",
      date: "2024-09-20",
      attendees: 85,
      revenue: 8500,
      status: "active"
    },
    {
      id: "3",
      title: "Business Networking Summit",
      date: "2024-10-05",
      attendees: 150,
      revenue: 30000,
      status: "upcoming"
    }
  ];

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  };

  const eventsChange = calculatePercentageChange(stats.eventsThisMonth, stats.eventsLastMonth);
  const revenueChange = calculatePercentageChange(stats.revenueThisMonth, stats.revenueLastMonth);

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Manage your events and track performance</p>
          </div>
          <Link href="/dashboard/create-event">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {eventsChange > 0 ? (
                  <ArrowUpRight className="w-3 h-3 text-green-600 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-red-600 mr-1" />
                )}
                {Math.abs(eventsChange).toFixed(1)}% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Events</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeEvents}</div>
              <p className="text-xs text-muted-foreground">
                Currently running
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAttendees.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all events
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {revenueChange > 0 ? (
                  <ArrowUpRight className="w-3 h-3 text-green-600 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-red-600 mr-1" />
                )}
                {Math.abs(revenueChange).toFixed(1)}% from last month
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{event.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>{event.date}</span>
                      <span>{event.attendees} attendees</span>
                      <span>₹{event.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={event.status === "active" ? "default" : "secondary"}
                    >
                      {event.status === "active" ? "Active" : "Upcoming"}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Link href={`/dashboard/events/${event.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/dashboard/events/${event.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <Link href="/dashboard/events">
                <Button variant="outline">
                  View All Events
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/dashboard/create-event">
              <CardContent className="p-6 text-center">
                <Plus className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Create New Event</h3>
                <p className="text-sm text-muted-foreground">
                  Start planning your next amazing event
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/dashboard/analytics">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">View Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Track performance and insights
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/dashboard/settings">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Manage Team</h3>
                <p className="text-sm text-muted-foreground">
                  Add organizers and volunteers
                </p>
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
