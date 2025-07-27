"use client";
import { SubscriptionPlanSchema } from '@/features/subscription/subscription-plan.schema';
import { SubscriptionPlanAdminConfig } from '@/features/subscription/subscription-plan.admin-config';
import { SimpleAdminPage } from '@/shared/components/atoms/ui/simple-admin-page';

export default function SubscriptionPlanAdminPage() {
  return (
    <SimpleAdminPage
      config={SubscriptionPlanAdminConfig}
      schema={SubscriptionPlanSchema}
    />
  );
}
