import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionPlanService, SubscriptionPlanPayload } from '../subscription-plan.service';

export function useSubscriptionPlans(params?: { skip?: number; limit?: number }) {
  return useQuery({
    queryKey: ['subscription-plans', params],
    queryFn: () => subscriptionPlanService.list(params),
  });
}

export function useSubscriptionPlan(id: string) {
  return useQuery({
    queryKey: ['subscription-plan', id],
    queryFn: () => subscriptionPlanService.get(id),
    enabled: !!id,
  });
}

export function useCreateSubscriptionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubscriptionPlanPayload) => subscriptionPlanService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
    },
  });
}

export function useUpdateSubscriptionPlan(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubscriptionPlanPayload) => subscriptionPlanService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-plan', id] });
    },
  });
}

export function useDeleteSubscriptionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subscriptionPlanService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
    },
  });
}

export function usePublicSubscriptionPlans(params?: { skip?: number; limit?: number }) {
  return useQuery({
    queryKey: ['public-subscription-plans', params],
    queryFn: () => subscriptionPlanService.listPublic(params),
  });
}
