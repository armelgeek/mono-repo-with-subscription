"use client";


import { Badge } from '@/shared/components/atoms/ui/badge';
import { useCurrentSubscription } from '../hooks/use-subscription';
import { useSubscriptionPlans } from '../hooks/use-subscription-plan';
import type { SubscriptionPlan } from '../subscription-plan.schema';

type CurrentSubscription = {
  planId?: string | null;
  isExpired?: boolean;
  isCanceled?: boolean;
  interval?: string | null;
  accessEndsAt?: string | null;
  activeUntil?: string | null;
  trialDaysLeft?: number | null;
  trialEndDate?: string | null;
  maxLimit?: number | null;
  isTrial?: boolean;
};

export function UserSubscriptionDetails() {
  const { data: currentResp, isLoading: loadingSub } = useCurrentSubscription();
  const { data: plansResp, isLoading: loadingPlans } = useSubscriptionPlans();
  const current = currentResp && currentResp.data ? (currentResp.data as CurrentSubscription) : undefined;
  const plans = plansResp?.data as SubscriptionPlan[] | undefined;

  if (loadingSub || loadingPlans) return <div>Chargement de l’abonnement...</div>;
  if (!current) return <div>Aucun abonnement actif.</div>;

  const currentPlan = current.planId && plans ? plans.find(p => p.id === current.planId) : undefined;

  return (
    <section className="border rounded p-3 bg-white shadow-sm mb-4">
      <h2 className="font-bold text-base mb-1">Abonnement & services</h2>
      {currentPlan ? (
        <div className="text-sm space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{currentPlan.name}</span>
            <span className="text-gray-500">({current.interval === 'year' ? 'Annuel' : 'Mensuel'})</span>
            {current.isTrial && (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Essai</Badge>
            )}
            {current.isCanceled ? (
              <Badge className="bg-red-100 text-red-700 border-red-200">Annulé</Badge>
            ) : current.isExpired ? (
              <Badge className="bg-gray-100 text-gray-700 border-gray-200">Expiré</Badge>
            ) : (
              <Badge className="bg-green-100 text-green-800 border-green-200">Actif</Badge>
            )}
          </div>
          <div className="text-gray-600 truncate">{currentPlan.description}</div>
          {current.isTrial && (
            <div className="text-yellow-700">
              {current.trialDaysLeft} jour{current.trialDaysLeft === 1 ? '' : 's'} restants
              {current.trialEndDate && (
                <> (fin : {new Date(current.trialEndDate).toLocaleDateString()})</>
              )}
            </div>
          )}
          {current.activeUntil && (
            <div>Actif jusqu’au : <span className="font-medium">{new Date(current.activeUntil).toLocaleDateString()}</span></div>
          )}
          <div>Limite d’usage : <span className="font-medium">{current.maxLimit ?? '—'}</span></div>
          <div className="pt-2">
            <a href="/subscription-plans">
              <button className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs">Gérer mon abonnement</button>
            </a>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500">Aucun abonnement actif.</div>
      )}
    </section>
  );
}
