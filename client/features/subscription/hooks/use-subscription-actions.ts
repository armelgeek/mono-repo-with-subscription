import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '../subscription.service';

export function useSubscriptionActions() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: subscriptionService.createSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
    }
  });

  const change = useMutation({
    mutationFn: subscriptionService.changeSubscriptionPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
    }
  });

  const cancel = useMutation({
    mutationFn: subscriptionService.cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
    }
  });

  const openBillingPortal = useMutation({
    mutationFn: subscriptionService.openBillingPortal
  });

  return {
    create,
    change,
    cancel,
    openBillingPortal
  };
}
