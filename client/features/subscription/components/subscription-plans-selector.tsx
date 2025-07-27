"use client";
import { useState } from 'react';

import { useSubscriptionPlans } from '../hooks/use-subscription-plan';
import { useCurrentSubscription, useCreateSubscription, useChangeSubscriptionPlan } from '../hooks/use-subscription';
import type { SubscriptionPlan } from '../subscription-plan.schema';


export function SubscriptionPlansSelector({ onSuccess }: { onSuccess?: () => void }) {
  const { data: plansResp, isLoading } = useSubscriptionPlans();
  const { data: currentResp } = useCurrentSubscription();
  const plans = plansResp?.data as SubscriptionPlan[] | undefined;
  const current = currentResp && currentResp.data ? (currentResp.data as { planId?: string }) : undefined;
  const [interval, setInterval] = useState<'month' | 'year'>('month');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const create = useCreateSubscription();
  const change = useChangeSubscriptionPlan();

  if (isLoading) return <div>Chargement des plans...</div>;
  if (!plans?.length) return <div>Aucun plan disponible.</div>;

  const handleSelect = (planId: string) => setSelectedPlan(planId);
  const handleSubscribe = () => {
    if (!selectedPlan) return;
    if (current?.planId === selectedPlan) return;
    if (current) {
      change.mutate({ planId: selectedPlan, interval }, { onSuccess });
    } else {
      create.mutate({ planId: selectedPlan, interval, successUrl: '/', cancelUrl: '/' }, { onSuccess });
    }
  };

  return (
    <div>
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
            {current?.planId === plan.id && <div className="text-green-600 mt-2">Abonnement actuel</div>}
          </div>
        ))}
      </div>
      <button
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        disabled={!selectedPlan || create.isPending || change.isPending || current?.planId === selectedPlan}
        onClick={handleSubscribe}
      >
        {current ? 'Changer de plan' : 'Souscrire'}
      </button>
    </div>
  );
}
