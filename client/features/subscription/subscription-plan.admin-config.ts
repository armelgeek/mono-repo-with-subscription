import { createAdminEntity, registerAdminEntity } from '@/shared/lib/admin/admin-generator';
import { SubscriptionPlanSchema } from './subscription-plan.schema';
import { subscriptionPlanAdminCrud } from './subscription-plan.admin-crud-adapter';

export const SubscriptionPlanAdminConfig = createAdminEntity('Plan d’abonnement', SubscriptionPlanSchema, {
  description: 'Gérez vos plans d’abonnement',
  icon: '💳',
  actions: { create: true, read: true, update: true, delete: true, bulk: false },
  services: subscriptionPlanAdminCrud,
  queryKey: ['subscription-plans'],
  formFields: [
    'name',
    'description',
    'limit',
    'priceMonthly',
    'priceYearly',
    'displayedYearly',
    'displayedMonthly',
    'displayedYearlyBar',
    'currency',
  ],
  ui: {
    form: {
      layout: 'sections',
      sections: [
        {
          title: 'Informations générales',
          fields: ['name', 'description', 'limit', 'currency']
        },
        {
          title: 'Tarification & Affichage',
          fields: [
            'priceMonthly',
            'priceYearly',
            'displayedMonthly',
            'displayedYearly',
            'displayedYearlyBar'
          ]
        }
      ]
    }
  },
});


registerAdminEntity('subscription-plans', SubscriptionPlanAdminConfig, '/admin/subscription-plans', '📅',3);

