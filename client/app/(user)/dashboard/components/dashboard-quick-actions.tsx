"use client";
import { Button } from "@/shared/components/atoms/ui/button";
import { FileText, Calendar, CreditCard, Settings } from "lucide-react";

const quickActions = [
  {
    title: "Nouveau projet",
    description: "Créer un nouveau projet",
    icon: FileText,
    onClick: () => console.log("Nouveau projet")
  },
  {
    title: "Planifier un RDV",
    description: "Ajouter un rendez-vous",
    icon: Calendar,
    onClick: () => console.log("Nouveau RDV")
  },
  {
    title: "Voir les factures",
    description: "Gérer la facturation",
    icon: CreditCard,
    onClick: () => console.log("Factures")
  },
  {
    title: "Paramètres",
    description: "Configuration du compte",
    icon: Settings,
    onClick: () => console.log("Paramètres")
  }
];

export function DashboardQuickActions() {
  return (
    <div className="space-y-2 sm:space-y-3">
      {quickActions.map((action, index) => (
        <Button
          key={index}
          variant="ghost"
          className="w-full justify-start h-auto p-3 sm:p-4 hover:bg-gray-50"
          onClick={action.onClick}
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
    </div>
  );
}
