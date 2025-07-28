"use client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/components/atoms/ui/card";
import { Button } from "@/shared/components/atoms/ui/button";
import { Shield } from "lucide-react";

export function ProfileSecurityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Sécurité et confidentialité
        </CardTitle>
        <CardDescription>
          Gérez la sécurité de votre compte
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium">Mot de passe</h4>
            <p className="text-sm text-gray-600">Dernière modification il y a 3 mois</p>
          </div>
          <Button variant="outline" size="sm">
            Modifier
          </Button>
        </div>
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium">Authentification à deux facteurs</h4>
            <p className="text-sm text-gray-600">Sécurisez votre compte avec 2FA</p>
          </div>
          <Button variant="outline" size="sm">
            Activer
          </Button>
        </div>
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium">Sessions actives</h4>
            <p className="text-sm text-gray-600">Gérer vos appareils connectés</p>
          </div>
          <Button variant="outline" size="sm">
            Voir tout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
