"use client";

import { UserSubscriptionDetails } from '@/features/subscription/components/user-subscription-details';
import { SubscriptionHistory } from '@/features/subscription/components/subscription-history';
import { PaymentMethodManager } from '@/features/subscription/components/payment-method-manager';

export default function UserProfileSubscriptionPage() {
  return (
    <div className="mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mon abonnement</h1>
      <UserSubscriptionDetails />
      <PaymentMethodManager />
      <SubscriptionHistory />
    </div>
  );
}
