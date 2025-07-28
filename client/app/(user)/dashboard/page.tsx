"use client";

import { useAuth } from "@/shared/providers/auth-provider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/components/atoms/ui/card";
import { DashboardHeader } from "./components/dashboard-header";
import { DashboardStats } from "./components/dashboard-stats";
import { DashboardActivity } from "./components/dashboard-activity";
import { DashboardQuickActions } from "./components/dashboard-quick-actions";
import { DashboardEvents } from "./components/dashboard-events";

import { 
  useDashboardStats, 
  useRecentActivity, 
  useUpcomingEvents,
  useUnreadNotificationsCount 
} from "@/features/dashboard/hooks/use-dashboard";

 
export default function UserDashboardPage() {
  const { isLoading: authLoading } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentActivities, isLoading: activitiesLoading } = useRecentActivity(3);
  const { data: upcomingEvents, isLoading: eventsLoading } = useUpcomingEvents(2);
  const { data: unreadCount } = useUnreadNotificationsCount();

  if (authLoading || statsLoading) {
    return (
      <div className="space-y-8">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const statsData = stats ? [
    {
      title: "Projets actifs",
      value: stats.activeProjects.toString(),
      description: "En cours",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Rendez-vous",
      value: stats.upcomingMeetings.toString(),
      description: "Cette semaine",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Factures",
      value: stats.pendingInvoices.toString(),
      description: "En attente",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Activité",
      value: stats.totalActivity.toString(),
      description: "Derniers jours",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ] : [];





  return (
    <div className="space-y-8">
      <DashboardHeader userName={"Utilisateur"} unreadCount={unreadCount} />
      <DashboardStats stats={statsData} />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        <DashboardActivity
          activities={recentActivities || []}
          loading={activitiesLoading}
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Actions rapides</CardTitle>
            <CardDescription className="text-sm">
              Raccourcis vers vos fonctionnalités les plus utilisées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardQuickActions />
          </CardContent>
        </Card>
      </div>
      <DashboardEvents events={upcomingEvents || []} loading={eventsLoading} />
    </div>
  );
}
