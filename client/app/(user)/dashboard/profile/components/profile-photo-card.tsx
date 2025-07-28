"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/atoms/ui/card";
import { Button } from "@/shared/components/atoms/ui/button";
import { Camera, User } from "lucide-react";
import Image from 'next/image';

interface ProfilePhotoCardProps {
  image?: string;
}

export function ProfilePhotoCard({ image }: ProfilePhotoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Photo de profil
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
          {image ? (
            <Image src={image} alt="Photo de profil" width={128} height={128} className="w-32 h-32 object-cover rounded-full" />
          ) : (
            <User className="h-16 w-16 text-gray-400" />
          )}
        </div>
        <Button variant="outline" size="sm" disabled>
          Changer la photo (à venir)
        </Button>
      </CardContent>
    </Card>
  );
}
