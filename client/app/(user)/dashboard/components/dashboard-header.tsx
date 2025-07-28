"use client";
import { Button } from "@/shared/components/atoms/ui/button";
import { Bell } from "lucide-react";

interface DashboardHeaderProps {
  userName: string;
  unreadCount?: number;
}

export function DashboardHeader({ userName, unreadCount }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Bonjour, {userName} 👋
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
  );
}
