import { subscriptionPlanService, SubscriptionPlanPayload } from './subscription-plan.service';

export const subscriptionPlanAdminCrud = {
  fetchItems: async (filters?: Record<string, string | number | undefined>) => {
    const params: { skip?: number; limit?: number } = {};
    if (filters?.skip) params.skip = Number(filters.skip);
    if (filters?.limit) params.limit = Number(filters.limit);
    const res = await subscriptionPlanService.list(params);
    return { data: res.data as SubscriptionPlanPayload[] };
  },
  createItem: async (data: SubscriptionPlanPayload) => {
    const res = await subscriptionPlanService.create(data);
    return res.data as SubscriptionPlanPayload;
  },
  updateItem: async (id: string, data: Partial<SubscriptionPlanPayload>) => {
    const res = await subscriptionPlanService.update(id, data as SubscriptionPlanPayload);
    return res.data as SubscriptionPlanPayload;
  },
  deleteItem: async (id: string) => {
    await subscriptionPlanService.delete(id);
  },
};
