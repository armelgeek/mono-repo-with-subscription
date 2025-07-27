
import { createAdminEntity, registerAdminEntity } from '@/shared/lib/admin/admin-generator';
import { UserSchema } from './user.schema';
import { userService } from './user.service';
import React from 'react';
import { UserAdminToolbarActions } from './components/user-admin-toolbar-actions';

export const UserAdminConfig = createAdminEntity('Utilisateur', UserSchema, {
  description: 'Gérez vos utilisateurs',
  icon: '👤',
  actions: { create: false, read: false, update: false, delete: false, bulk: true },
  services: userService,
  queryKey: ['users'],
  formFields: [
    'name',
    'email',
    'role',
    'emailVerified',
    'banned',
    'banReason',
    'banExpires',
    'impersonatedBy',
    'image',
  ],
  ui: {
    form: {
      layout: 'two-cols',
    },
    toolbarActions: (selectedRows: Record<string, unknown>[]) =>
      React.createElement(UserAdminToolbarActions, { selectedRows: selectedRows as import('./user.schema').User[] }),
  },
});

registerAdminEntity('user', UserAdminConfig, '/admin/users', '�',2);
    