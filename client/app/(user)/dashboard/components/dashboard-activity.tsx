"use client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/components/atoms/ui/card";
import { Button } from "@/shared/components/atoms/ui/button";
import { Clock, FileText, Calendar, CreditCard, TrendingUp } from "lucide-react";

interface Activity {
  type: string;
  title: string;
  description: string;
  date: string;
}


interface DashboardActivityProps {
  activities: Activity[];
  loading: boolean;
}

function getActivityIcon(type: string) {
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
}

import { ActivityTypeDescriptions } from '@/shared/constants/activity-type-descriptions';

function getActivityLabel(type: string, title: string) {
  return ActivityTypeDescriptions[type] || title;
}

function formatActivityTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  if (diffInHours < 1) return "À l'instant";
  if (diffInHours < 24) return `Il y a ${diffInHours}h`;
  return `Il y a ${Math.floor(diffInHours / 24)} jour(s)`;
}

export function DashboardActivity({ activities, loading }: DashboardActivityProps) {
  return (
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
        {loading ? (
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
        ) : activities && activities.length > 0 ? (
          <>
            {activities.map((activity, index) => {
              const ActivityIcon = getActivityIcon(activity.type);
              const activityLabel = getActivityLabel(activity.type, activity.title);
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
  );
}
