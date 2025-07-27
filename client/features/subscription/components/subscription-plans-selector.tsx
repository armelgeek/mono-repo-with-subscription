"use client";
import { useState } from 'react';
import { useEffect } from 'react';


import { useSubscriptionPlans } from '../hooks/use-subscription-plan';
import { useCurrentSubscription, useCreateSubscription, useChangeSubscriptionPlan } from '../hooks/use-subscription';
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
  // Ajoute d’autres propriétés connues ici si besoin
};


export function SubscriptionPlansSelector({ onSuccess }: { onSuccess?: () => void }) {
  const { data: plansResp, isLoading } = useSubscriptionPlans();
  const { data: currentResp } = useCurrentSubscription();
  const plans = plansResp?.data as SubscriptionPlan[] | undefined;
 
  const current = currentResp && currentResp.data ? (currentResp.data as CurrentSubscription) : undefined;

  // L’utilisateur n’est pas abonné si pas de planId OU isExpired true OU isCanceled true
  const hasActiveSubscription = current && current.planId && !current.isExpired && !current.isCanceled;
  const [interval, setInterval] = useState<'month' | 'year'>('month');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const create = useCreateSubscription();
  const change = useChangeSubscriptionPlan();

  // Redirection automatique vers Stripe si paymentUrl est présent
  useEffect(() => {
    const paymentUrl = (create.data?.data as { paymentUrl?: string } | undefined)?.paymentUrl;
    if (paymentUrl) {
      window.location.href = paymentUrl;
    }
  }, [create.data]);

  if (isLoading) return <div>Chargement des plans...</div>;
  if (!plans?.length) return <div>Aucun plan disponible.</div>;

  const handleSelect = (planId: string) => setSelectedPlan(planId);
  const handleSubscribe = () => {
    if (!selectedPlan) return;
    if (hasActiveSubscription && current?.planId === selectedPlan) return;
    if (hasActiveSubscription) {
      change.mutate({ planId: selectedPlan, interval }, { onSuccess });
    } else {
      create.mutate({ planId: selectedPlan, interval, successUrl: 'http://localhost:5173/payment-success', cancelUrl: 'http://localhost:5173/payment-cancel' }, { onSuccess });
    }
  };
  const currentPlan = hasActiveSubscription
    ? plans?.find(plan => plan.id === current?.planId)
    : undefined;

    console.log('currentPlan', current);

  return (
    <div>
      {hasActiveSubscription && currentPlan && (
        <div className="mb-6 p-4 border border-green-400 rounded bg-green-50">
          <div className="font-bold text-green-700 text-lg">Votre abonnement actuel</div>
          <div className="mt-1 text-base">{currentPlan.name}</div>
          <div className="text-sm text-gray-600">{currentPlan.description}</div>
          <div className="mt-2 text-xl">
            {current.interval === 'year'
              ? `${currentPlan.priceYearly} ${currentPlan.currency} / an`
              : `${currentPlan.priceMonthly} ${currentPlan.currency} / mois`}
          </div>
          {current.activeUntil && (
            <div className="text-xs text-gray-500 mt-1">
              Actif jusqu’au : {new Date(current.activeUntil).toLocaleDateString()}
            </div>
          )}
        </div>
      )}
      <div className="flex gap-2 mb-4">
        <button
          className={interval === 'month' ? 'font-bold underline' : ''}
          onClick={() => setInterval('month')}
        >
          Mensuel
        </button>
        <button
          className={interval === 'year' ? 'font-bold underline' : ''}
          onClick={() => setInterval('year')}
        >
          Annuel
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map(plan => (
          <div
            key={plan.id}
            className={`border rounded p-4 cursor-pointer ${selectedPlan === plan.id ? 'border-blue-500' : 'border-gray-200'}`}
          onClick={() => plan.id && handleSelect(plan.id)}
          >
            <div className="text-lg font-semibold">{plan.name}</div>
            <div className="text-sm text-gray-500">{plan.description}</div>
            <div className="mt-2 text-xl">
              {interval === 'month' ? plan.priceMonthly : plan.priceYearly} {plan.currency}
            </div>
            {hasActiveSubscription && current?.planId === plan.id && (
              <div className="text-green-600 mt-2">Abonnement actuel</div>
            )}
          </div>
        ))}
      </div>
      <button
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        disabled={Boolean(
          !selectedPlan || create.isPending || change.isPending || (hasActiveSubscription && current?.planId === selectedPlan)
        )}
        onClick={handleSubscribe}
      >
        {hasActiveSubscription ? 'Changer de plan' : 'Souscrire'}
      </button>
    </div>
  );
}
