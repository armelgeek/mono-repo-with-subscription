
import { Metadata } from 'next';
import AdminLayoutClient from '@/shared/layout/admin/admin-layout-client';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Manage',
};

interface AdminLayoutProps {
  readonly children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  
  return (
    <AdminLayoutClient defaultOpen={true}>
      {children}
    </AdminLayoutClient>
  );
}
