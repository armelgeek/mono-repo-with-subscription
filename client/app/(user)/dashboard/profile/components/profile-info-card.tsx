"use client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/components/atoms/ui/card";
import { Input } from "@/shared/components/atoms/ui/input";
import { Label } from "@/shared/components/atoms/ui/label";
import { Textarea } from "@/shared/components/atoms/ui/textarea";
import { Button } from "@/shared/components/atoms/ui/button";
import { User, Mail, Phone, MapPin, Save } from "lucide-react";

interface ProfileInfoCardProps {
  form: {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    address: string;
  };
  isEditing: boolean;
  saving: boolean;
  successMsg?: string;
  errorMsg?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function ProfileInfoCard({ form, isEditing, saving, successMsg, errorMsg, onChange, onSave, onCancel }: ProfileInfoCardProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Informations personnelles
        </CardTitle>
        <CardDescription>
          Vos informations de base et coordonnées
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstname"
              value={form.firstname}
              onChange={onChange}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
            />
          </div>
          <div>
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastname"
              value={form.lastname}
              onChange={onChange}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={onChange}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="phone">Téléphone</Label>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-400" />
            <Input
              id="phone"
              value={form.phone}
              onChange={onChange}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="address">Adresse</Label>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-gray-400 mt-3" />
            <Textarea
              id="address"
              value={form.address}
              onChange={onChange}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
              rows={3}
            />
          </div>
        </div>
        {isEditing && (
          <div className="flex gap-2 pt-4">
            <Button onClick={onSave} className="gap-2" disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={saving}
            >
              Annuler
            </Button>
          </div>
        )}
        {successMsg && <div className="text-green-600 text-sm pt-2">{successMsg}</div>}
        {errorMsg && <div className="text-red-600 text-sm pt-2">{errorMsg}</div>}
      </CardContent>
    </Card>
  );
}
