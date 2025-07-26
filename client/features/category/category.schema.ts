import { z } from 'zod';
import { createField } from '@/shared/lib/admin/admin-generator';

export const CategorySchema = z.object({
  id: createField.string({ label: 'ID', display: { showInForm: false } }).optional(),
  name: createField.string({ label: 'Nom', display: { showInForm: true } }),
  description: createField.string({ label: 'Description', display: { showInForm: true } }),
  color: createField.string({ label: 'Couleur', display: { showInForm: true } })
});
export type CategoryFormData = z.infer<typeof CategorySchema>;