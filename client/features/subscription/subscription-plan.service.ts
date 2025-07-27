import { BaseService } from '@/shared/lib/services/base-service';
import { API_ENDPOINTS } from '@/shared/config/api';

const base = new BaseService();

export type SubscriptionPlanPayload = {
  name: string;
  description?: string;
  limit?: number;
  priceMonthly: number;
  priceYearly: number;
  displayedYearly: number;
  displayedMonthly: number;
  displayedYearlyBar: number;
  currency: string;
};

function toStringParams(params?: { skip?: number; limit?: number }): Record<string, string> | undefined {
  if (!params) return undefined;
  const out: Record<string, string> = {};
  if (params.skip !== undefined) out.skip = String(params.skip);
  if (params.limit !== undefined) out.limit = String(params.limit);
  return out;
}

export const subscriptionPlanService = {
  // Admin CRUD
  list: (params?: { skip?: number; limit?: number }) => base.get(API_ENDPOINTS.subscription.plans, toStringParams(params)),
  get: (id: string) => base.get(API_ENDPOINTS.subscription.plan(id)),
  create: (data: SubscriptionPlanPayload) => base.post(API_ENDPOINTS.subscription.plans, data),
  update: (id: string, data: SubscriptionPlanPayload) => base.put(API_ENDPOINTS.subscription.plan(id), data),
  delete: (id: string) => base.delete(API_ENDPOINTS.subscription.plan(id)),
  // Public
  listPublic: (params?: { skip?: number; limit?: number }) => base.get(API_ENDPOINTS.subscription.publicPlans, toStringParams(params)),
};
