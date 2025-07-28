"use client";
import { Button } from "@/shared/components/atoms/ui/button";

interface ProfileHeaderProps {
  isEditing: boolean;
  onEditToggle: () => void;
}

export function ProfileHeader({ isEditing, onEditToggle }: ProfileHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
        <p className="text-gray-600 mt-1">
          Gérez vos informations personnelles et préférences
        </p>
      </div>
      <Button 
        onClick={onEditToggle}
        variant={isEditing ? "outline" : "default"}
      >
        {isEditing ? "Annuler" : "Modifier"}
      </Button>
    </div>
  );
}
