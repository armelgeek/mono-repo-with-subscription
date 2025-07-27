import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '../subscription.service';

export function useSubscriptionInvoices() {
  return useQuery({
    queryKey: ['subscription-invoices'],
    queryFn: () => subscriptionService.getInvoices(),
  });
}

export function useSubscriptionPaymentMethod() {
  return useQuery({
    queryKey: ['subscription-payment-method'],
    queryFn: () => subscriptionService.getPaymentMethod(),
  });
}

export function useCreateSubscription() {
  return useMutation({
    mutationFn: subscriptionService.createSubscription,
  });
}

export function useSubscriptionStatus() {
  return useQuery({
    queryKey: ['subscription-status'],
    queryFn: () => subscriptionService.getSubscriptionStatus(),
  });
}

export function useOpenBillingPortal() {
  return useMutation({
    mutationFn: subscriptionService.openBillingPortal,
  });
}

export function useChangeSubscriptionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: subscriptionService.changeSubscriptionPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-invoices'] });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: subscriptionService.cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-invoices'] });
    },
  });
}

export function useCurrentSubscription() {
  return useQuery({
    queryKey: ['current-subscription'],
    queryFn: () => subscriptionService.getCurrentSubscription(),
  });
}
