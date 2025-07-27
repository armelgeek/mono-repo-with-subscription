"use client";
import { useCurrentSubscription } from '@/features/subscription/hooks/use-subscription';

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

export function TrialBanner() {
  const { data: currentResp } = useCurrentSubscription();
  const current = currentResp && currentResp.data ? (currentResp.data as CurrentSubscription) : undefined;

  if (!current?.isTrial) return null;

  return (
    <div className="w-full bg-yellow-50 border-b border-yellow-400 py-1 px-2 flex flex-col items-center z-50 text-xs">
      <div className="font-semibold text-yellow-700">Période d’essai en cours</div>
      {typeof current.trialDaysLeft === 'number' && (
        <div className="text-[11px] text-yellow-800 mt-0.5">
          Il vous reste {current.trialDaysLeft} jour{current.trialDaysLeft === 1 ? '' : 's'} d’essai gratuit.
        </div>
      )}
      {current.trialEndDate && (
        <div className="text-[10px] text-gray-600 mt-0.5">
          Fin de l’essai : {new Date(current.trialEndDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
