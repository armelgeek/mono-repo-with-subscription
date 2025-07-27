

import { BaseService } from '@/shared/lib/services/base-service';
import { API_ENDPOINTS } from '@/shared/config/api';


export type SubscriptionInvoice = {
  id: string;
  plan: string;
  start: string | null;
  end: string | null;
  status: string;
  amount?: number;
  currency?: string;
  paidAt?: string | null;
  invoiceUrl?: string | null;
};


const base = new BaseService();

export const subscriptionService = {
  getInvoices: () => base.get(API_ENDPOINTS.subscription.invoices),
  getHistory: async (): Promise<SubscriptionInvoice[]> => {
    const res = await base.get(API_ENDPOINTS.subscription.invoices) as {
      success: boolean;
      data: Array<{
        id: string;
        planName?: string;
        periodStart: string | null;
        periodEnd: string | null;
        status: string;
        amount?: number;
        currency?: string;
        paidAt?: string | null;
        invoiceUrl?: string | null;
      }>;
    };
    if (!res?.success || !Array.isArray(res.data)) return [];
    return res.data.map((inv) => ({
      id: inv.id,
      plan: inv.planName || '-',
      start: inv.periodStart,
      end: inv.periodEnd,
      status: inv.status === 'paid' ? 'Actif' : inv.status === 'canceled' ? 'Annulé' : 'Expiré',
      amount: inv.amount,
      currency: inv.currency,
      paidAt: inv.paidAt,
      invoiceUrl: inv.invoiceUrl,
    }));
  },
  getPaymentMethod: () => base.get(API_ENDPOINTS.subscription.paymentMethod),
  createSubscription: (data: { planId: string; interval: 'month' | 'year'; successUrl: string; cancelUrl: string }) =>
    base.post(API_ENDPOINTS.subscription.create, data),
  getSubscriptionStatus: () => base.get(API_ENDPOINTS.subscription.status),
  openBillingPortal: (data: { returnUrl?: string }) => base.post(API_ENDPOINTS.subscription.paymentMethodUpdate, data),
  changeSubscriptionPlan: (data: { planId: string; interval: 'month' | 'year' }) =>
    base.post(API_ENDPOINTS.subscription.change, data),
  cancelSubscription: () => base.post(API_ENDPOINTS.subscription.cancel, {}),
  getCurrentSubscription: () => base.get(API_ENDPOINTS.subscription.current),
};
