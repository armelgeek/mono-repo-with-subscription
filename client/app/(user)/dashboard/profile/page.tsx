"use client";

import { useAuth } from "@/shared/providers/auth-provider";
import { useUserSession, useUpdateUser } from "@/features/user/hooks/use-user";

import { useState, useEffect } from "react";
import { ProfileHeader } from "./components/profile-header";
import { ProfilePhotoCard } from "./components/profile-photo-card";
import { ProfileInfoCard } from "./components/profile-info-card";
import { ProfileSecurityCard } from "./components/profile-security-card";


export default function ProfilePage() {
  const { isLoading: authLoading, refreshSession } = useAuth();
  const { data: sessionData, isLoading: sessionLoading } = useUserSession();
  const user = sessionData?.data;
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    address: "",
    image: ""
  });
  const [saving, setSaving] = useState(false);
  const updateUser = useUpdateUser();
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        image: user.image || ""
      });
    }
  }, [user]);

  if (authLoading || sessionLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await updateUser.mutateAsync({ id: user.id, data: form });
      setIsEditing(false);
      setSuccessMsg("Profil sauvegardé avec succès");
      refreshSession();
    } catch {
      setErrorMsg("Erreur lors de la sauvegarde du profil");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <ProfileHeader isEditing={isEditing} onEditToggle={() => setIsEditing(!isEditing)} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ProfilePhotoCard image={form.image} />
        <ProfileInfoCard
          form={form}
          isEditing={isEditing}
          saving={saving}
          successMsg={successMsg}
          errorMsg={errorMsg}
          onChange={handleChange}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      </div>
      <ProfileSecurityCard />
    </div>
  );
}
