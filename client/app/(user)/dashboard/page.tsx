"use client";

import { useAuth } from "@/shared/providers/auth-provider";
import { Button } from "@/shared/components/atoms/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/atoms/ui/card";
import { Calendar, Clock, CreditCard, TrendingUp, FileText, Bell, Settings } from "lucide-react";

import { 
  useDashboardStats, 
  useRecentActivity, 
  useUpcomingEvents,
  useUnreadNotificationsCount 
} from "@/features/dashboard/hooks/use-dashboard";
import { ActivityTypeDescriptions } from '@/shared/constants/activity-type-descriptions';

 
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
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Rendez-vous",
      value: stats.upcomingMeetings.toString(),
      description: "Cette semaine",
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Factures",
      value: stats.pendingInvoices.toString(),
      description: "En attente",
      icon: CreditCard,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Activité",
      value: stats.totalActivity.toString(),
      description: "Derniers jours",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ] : [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project_created':
        return FileText;
      case 'meeting_completed':
        return Calendar;
      case 'invoice_sent':
      case 'payment_received':
        return CreditCard;
      case 'task_completed':
        return TrendingUp;
      default:
        return Clock;
    }
  };

  const formatActivityTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "À l'instant";
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    return `Il y a ${Math.floor(diffInHours / 24)} jour(s)`;
  };

  const quickActions = [
    {
      title: "Nouveau projet",
      description: "Créer un nouveau projet",
      icon: FileText,
      action: () => console.log("Nouveau projet")
    },
    {
      title: "Planifier un RDV",
      description: "Ajouter un rendez-vous",
      icon: Calendar,
      action: () => console.log("Nouveau RDV")
    },
    {
      title: "Voir les factures",
      description: "Gérer la facturation",
      icon: CreditCard,
      action: () => console.log("Factures")
    },
    {
      title: "Paramètres",
      description: "Configuration du compte",
      icon: Settings,
      action: () => console.log("Paramètres")
    }
  ];

  return (
    <div className="space-y-8">

      {/* En-tête avec salutation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Bonjour, Utilisateur 👋
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Voici un aperçu de votre activité aujourd&apos;hui
          </p>
        </div>
        <Button className="gap-2 w-full sm:w-auto">
          <Bell className="h-4 w-4" />
          <span className="sm:inline">Notifications</span>
          {unreadCount && unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </div>


      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {statsData.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.title}</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{stat.description}</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-lg ${stat.bgColor} self-start sm:self-auto`}>
                  <stat.icon className={`h-4 w-4 sm:h-6 sm:w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Activité récente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              Activité récente
            </CardTitle>
            <CardDescription className="text-sm">
              Vos dernières actions et événements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {activitiesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-start gap-3 p-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivities && recentActivities.length > 0 ? (
              <>
                {recentActivities.map((activity, index) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  const activityLabel = ActivityTypeDescriptions[activity.type] || activity.title;
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <ActivityIcon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{activityLabel}</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatActivityTime(activity.date)}</p>
                      </div>
                    </div>
                  );
                })}
                <Button variant="outline" className="w-full mt-4">
                  Voir tout l&apos;historique
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucune activité récente</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Actions rapides</CardTitle>
            <CardDescription className="text-sm">
              Raccourcis vers vos fonctionnalités les plus utilisées
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start h-auto p-3 sm:p-4 hover:bg-gray-50"
                onClick={action.action}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <action.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">{action.title}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{action.description}</p>
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Prochains événements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            Prochains événements
          </CardTitle>
          <CardDescription className="text-sm">
            Vos rendez-vous et échéances à venir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {eventsLoading ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingEvents && upcomingEvents.length > 0 ? (
              <>
                {upcomingEvents.map((event) => {
                  const eventDate = new Date(event.date);
                  const dayName = eventDate.toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase();
                  const dayNumber = eventDate.getDate();
                  
                  return (
                    <div key={event.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg">
                      <div className="flex flex-col items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 rounded-lg">
                        <span className="text-xs font-medium text-blue-600">{dayName}</span>
                        <span className="text-sm sm:text-lg font-bold text-blue-600">{dayNumber}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{event.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-600">{event.time}</p>
                        {event.location && (
                          <p className="text-xs text-gray-500 truncate">{event.location}</p>
                        )}
                      </div>
                      <Button size="sm" variant="outline" className="shrink-0">
                        <span className="hidden sm:inline">Détails</span>
                        <span className="sm:hidden">•••</span>
                      </Button>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun événement à venir</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
