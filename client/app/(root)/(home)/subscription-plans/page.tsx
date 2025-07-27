import { SubscriptionPlansSelector } from '@/features/subscription/components/subscription-plans-selector';

export default function PublicSubscriptionPlansPage() {
  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Choisissez votre abonnement</h1>
      <SubscriptionPlansSelector />
    </main>
  );
}
