"use client";

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';


import { usePublicSubscriptionPlans } from '../hooks/use-subscription-plan';
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
  isTrial?: boolean;
  // Ajoute d’autres propriétés connues ici si besoin
};


export function SubscriptionPlansSelector({ onSuccess }: { onSuccess?: () => void }) {
  const { data: plansResp, isLoading } = usePublicSubscriptionPlans();
  const { data: currentResp } = useCurrentSubscription();
  const plans = plansResp?.data as SubscriptionPlan[] | undefined;
 
  const current = currentResp && currentResp.data ? (currentResp.data as CurrentSubscription) : undefined;

  // L’utilisateur n’est pas abonné si pas de planId OU isExpired true OU isCanceled true
  const hasActiveSubscription = current && current.planId && !current.isExpired && !current.isCanceled;
  const [interval, setInterval] = useState<'month' | 'year'>('month');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const create = useCreateSubscription();
  const change = useChangeSubscriptionPlan();

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
      change.mutate(
        { planId: selectedPlan, interval },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
            onSuccess?.();
          },
        }
      );
    } else {
      create.mutate(
        { planId: selectedPlan, interval, successUrl: 'http://localhost:5173/payment-success', cancelUrl: 'http://localhost:5173/payment-cancel' },
        { onSuccess }
      );
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${interval === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setInterval('month')}
        >
          Mensuel
        </button>
        <button
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${interval === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setInterval('year')}
        >
          Annuel
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map(plan => {
          const isCurrent = hasActiveSubscription && current?.planId === plan.id;
          const isSelected = selectedPlan === plan.id;
          return (
            <div
              key={plan.id}
              className={`relative group border rounded-2xl p-6 cursor-pointer bg-gradient-to-br from-blue-50 via-white to-blue-100 shadow-lg transition-all duration-200
                ${isSelected ? 'border-blue-700 ring-2 ring-blue-200 scale-[1.03]' : 'border-gray-200 hover:border-blue-400 hover:scale-[1.01]'}
                ${isCurrent ? 'opacity-95' : ''}
                hover:shadow-xl
              `}
              style={{ minHeight: 180 }}
              onClick={() => plan.id && handleSelect(plan.id)}
            >
              <div className="absolute top-4 right-4 z-10">
                <span className={`px-3 py-1 rounded-full text-base font-bold shadow-sm border-2
                  ${isSelected ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-blue-700 border-blue-200'}
                `}>
                  {interval === 'month' ? plan.priceMonthly : plan.priceYearly} {plan.currency}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl select-none">💎</span>
                <span className="text-lg font-bold text-gray-900 tracking-tight">{plan.name}</span>
                {isCurrent && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 border border-green-200">Actuel</span>
                )}
                {isSelected && !isCurrent && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 border border-blue-200 animate-pulse">Sélectionné</span>
                )}
              </div>
              <div className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[2.5em]">{plan.description}</div>
              <div className="flex items-end gap-2 mt-6">
                <span className="text-xs text-gray-500">{interval === 'month' ? 'Facturation mensuelle' : 'Facturation annuelle'}</span>
                <span className="ml-auto text-xs text-gray-400 group-hover:text-blue-500 transition">Cliquez pour choisir</span>
              </div>
            </div>
          );
        })}
      </div>
      <button
        className="mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
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
