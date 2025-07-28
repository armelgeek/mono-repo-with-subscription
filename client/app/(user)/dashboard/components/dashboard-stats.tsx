"use client";
import { Card, CardContent } from "@/shared/components/atoms/ui/card";


import { FileText, Calendar, CreditCard, TrendingUp } from "lucide-react";

interface Stat {
  title: string;
  value: string;
  description: string;
  color: string;
  bgColor: string;
}

interface DashboardStatsProps {
  stats: Stat[];
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const icons = [FileText, Calendar, CreditCard, TrendingUp];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      {stats.map((stat, index) => {
        const Icon = icons[index] || FileText;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.title}</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{stat.description}</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-lg ${stat.bgColor} self-start sm:self-auto`}>
                  <Icon className={`h-4 w-4 sm:h-6 sm:w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
