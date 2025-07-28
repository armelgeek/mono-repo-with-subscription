"use client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/components/atoms/ui/card";
import { Button } from "@/shared/components/atoms/ui/button";
import { Calendar } from "lucide-react";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
}

interface DashboardEventsProps {
  events: Event[];
  loading: boolean;
}

export function DashboardEvents({ events, loading }: DashboardEventsProps) {
  return (
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
          {loading ? (
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
          ) : events && events.length > 0 ? (
            <>
              {events.map((event) => {
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
  );
}
