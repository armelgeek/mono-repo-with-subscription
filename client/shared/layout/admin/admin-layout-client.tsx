"use client";

import { useEffect, useState } from 'react';
import AppSidebar from '@/shared/layout/admin/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/shared/components/atoms/ui/sidebar';
import { Separator } from '@/shared/components/atoms/ui/separator';
import { AdminBreadcrumb } from '@/shared/components/molecules/layout/admin-breadcrumb';
import { HeaderUserProfile } from '@/shared/components/molecules/layout/header-user-profile';
import { authClient } from '@/shared/lib/config/auth-client';
import { Skeleton } from '@/shared/components/atoms/ui/skeleton';

type SessionType = {
  user?: {
    name?: string;
    email?: string;
    image?: string | null;
    role?: string;
  };
} | null;

interface AdminLayoutClientProps {
  readonly children: React.ReactNode;
  defaultOpen?: boolean;
}

function isAdmin(session: SessionType): boolean {
  return session?.user?.role === 'super_admin';
}

export default function AdminLayoutClient({ children, defaultOpen = true }: AdminLayoutClientProps) {
  const [session, setSession] = useState<SessionType>(null);
  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      try {
        const sessionData = await authClient.getSession();
        setSession(sessionData.data);
        if (!isAdmin(sessionData.data)) {
          setPermissionError(true);
        }
      } catch (error) {
        console.error('Failed to get session:', error);
        setSession(null);
        setPermissionError(true);
      } finally {
        setLoading(false);
      }
    };
    getSession();
  }, []);

  if (loading) {
    return (
      <SidebarProvider defaultOpen={defaultOpen}>
        <div className="w-64 h-screen bg-sidebar border-r flex flex-col">
          <div className="p-4">
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="flex-1 space-y-2 p-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Skeleton className="h-6 w-48" />
            </div>
            <div className="flex items-center gap-2 px-4">
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </header>
          <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (permissionError) {
    return (
      <SidebarProvider defaultOpen={defaultOpen}>
        <div className="w-64 h-screen bg-sidebar border-r flex flex-col">
          <div className="p-4">
            <span className="text-destructive font-semibold">Accès refusé</span>
          </div>
        </div>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2">
            <div className="flex items-center gap-2 px-4">
              <Separator orientation="vertical" className="mr-2 h-4" />
              <span className="text-destructive font-semibold">Vous n&apos;avez pas la permission d&apos;accéder à l&apos;admin.</span>
            </div>
          </header>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar session={session} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-gray-200">
          <div className="flex items-center gap-2 px-4">
            <Separator orientation="vertical" className="mr-2 h-4" />
            <AdminBreadcrumb />
          </div>
          <div className="flex items-center gap-2 px-4">
            {session?.user && <HeaderUserProfile user={session.user} />}
          </div>
        </header>
        <div className='flex flex-1 flex-col gap-4 p-4 pt-4'>
          <div className="space-y-6 px-3">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
