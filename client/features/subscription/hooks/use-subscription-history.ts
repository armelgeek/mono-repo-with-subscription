


import { useQuery } from '@tanstack/react-query';
import { subscriptionService, SubscriptionInvoice } from '../subscription.service';

export function useSubscriptionHistory() {
  return useQuery<SubscriptionInvoice[]>({
    queryKey: ['subscription-history'],
    queryFn: () => subscriptionService.getHistory(),
  });
}
