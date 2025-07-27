import { z } from 'zod';
import { createField } from '@/shared/lib/admin/admin-generator';

export const SubscriptionPlanSchema = z.object({
  id: createField.string({ label: 'ID', display: { showInTable: false, showInForm: false } }).optional(),
  name: createField.string({ label: 'Nom', display: { showInTable: true, showInForm: true, order: 1 } }),
  description: createField.string({ label: 'Description', display: { showInTable: false, showInForm: true, order: 2 } }),
  limit: createField.number({ label: 'Limite', display: { showInTable: true, showInForm: true, order: 3 } }),
  priceMonthly: createField.number({ label: 'Prix mensuel', display: { showInTable: true, showInForm: true, order: 4, prefix: '€ ' } }),
  priceYearly: createField.number({ label: 'Prix annuel', display: { showInTable: true, showInForm: true, order: 5, prefix: '€ ' } }),
  displayedYearly: createField.number({ label: 'Prix barré annuel', display: { showInTable: false, showInForm: true, order: 6, prefix: '€ ' } }),
  displayedMonthly: createField.number({ label: 'Prix barré mensuel', display: { showInTable: false, showInForm: true, order: 7, prefix: '€ ' } }),
  displayedYearlyBar: createField.number({ label: 'Prix barré affiché/an', display: { showInTable: false, showInForm: true, order: 8, prefix: '€ ' } }),
  currency: createField.string({
    label: 'Devise',
    options: [
      { value: 'USD', label: 'Dollar ($)' },
      { value: 'EUR', label: 'Euro (€)' }
    ],
    display: {
      showInTable: true,
      showInForm: true,
      order: 9,
      widget: 'select'
    }
  }),
  createdAt: createField.date({ label: 'Créé le', display: { showInTable: true, showInForm: false, order: 10 } }).optional(),
  updatedAt: createField.date({ label: 'Modifié le', display: { showInTable: false, showInForm: false } }).optional()
});

export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>;
