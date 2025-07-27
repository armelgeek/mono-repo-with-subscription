"use client";
import { UserSchema } from '@/features/user/user.schema';
import { UserAdminConfig } from '@/features/user/user.admin-config';
import { SimpleAdminPage } from '@/shared/components/atoms/ui/simple-admin-page';

export default function UserAdminPage() {
  return (
    <SimpleAdminPage config={UserAdminConfig} schema={UserSchema} />
  );
}
