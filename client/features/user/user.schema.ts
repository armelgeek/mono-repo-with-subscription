
import { z } from 'zod';
import { createField } from '@/shared/lib/admin/admin-generator';

export const UserSchema = z.object({
  id: createField.string({ label: 'ID', display: { showInTable: false, showInForm: false } }),
  name: createField.string({ label: 'Nom', display: { showInTable: true, showInForm: true, order: 1 } }),
  email: createField.email({ label: 'Email', display: { showInTable: true, showInForm: true, order: 2 } }),
  role: createField.select(['user', 'admin', 'super_admin'], { label: 'Rôle', display: { showInTable: true, showInForm: true, widget: 'select', order: 3 } }),
  banned: createField.boolean({ label: 'Banni', display: { showInTable: true, showInForm: true, widget: 'radio', order: 4 } }),
  banReason: createField.string({ label: 'Raison du bannissement', display: { showInTable: false, showInForm: true, order: 5 } }),
  banExpires: createField.date({ label: 'Fin du bannissement', display: { showInTable: false, showInForm: true, order: 6 } }),
  emailVerified: createField.boolean({ label: 'Email vérifié', display: { showInTable: true, showInForm: true, widget: 'radio', order: 7 } }),
  impersonatedBy: createField.string({ label: 'Impersonné par', display: { showInTable: false, showInForm: true, order: 8 } }),
  firstname: createField.string({ label: 'Prénom', display: { showInTable: false, showInForm: true } }),
  lastname: createField.string({ label: 'Nom de famille', display: { showInTable: false, showInForm: true } }),
  image: createField.string({ label: 'Image', display: { showInTable: false, showInForm: true } }),
  isAdmin: createField.boolean({ label: 'Admin', display: { showInTable: false, showInForm: true } }),
  accounts: createField.list({ label: 'Comptes liés', display: { showInTable: false, showInForm: false } }),
  avatarUrl: createField.string({ label: 'Avatar', display: { showInTable: false, showInForm: false } }),
  lastSignIn: createField.date({ label: 'Dernière connexion', display: { showInTable: false, showInForm: false } }),
  createdAt: createField.date({ label: 'Créé le', display: { showInTable: true, showInForm: false, order: 9 } }),
  updatedAt: createField.date({ label: 'Modifié le', display: { showInTable: false, showInForm: false } })
});

export type User = z.infer<typeof UserSchema>;
