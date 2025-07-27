
import { BaseService } from '@/shared/lib/services/base-service';
import { API_ENDPOINTS } from '@/shared/config/api';

const base = new BaseService();

export const subscriptionService = {
    getInvoices: () => base.get(API_ENDPOINTS.subscription.invoices),
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
