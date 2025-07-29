export const API_ENDPOINTS = {
  endpoint: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api",
    version: "v1",
  },
  blog: {
    base: "/v1/posts",
    list: "/v1/posts",
    detail: (id: string) => `/v1/posts/${id}`,
    create: "/v1/posts",
    update: (id: string) => `/v1/posts/${id}`,
    delete: (id: string) => `/v1/posts/${id}`,
  },
  user: {
    list: "/v1/admin/users",
    detail: (id: string) => `v1/admin/users/${id}`,
    byEmail: (email: string) => `v1/admin/users/email/${email}`,
    update: (id: string) => `v1/admin/users/${id}`,
    delete: (id: string) => `v1/admin/users/${id}`,
    session: "v1/users/session",
  },
  category: {
    base: "/categories",
    list: "/categories",
    detail: (id: string) => `/categories/${id}`,
    bySlug: (slug: string) => `/categories/slug/${slug}`,
    create: "/categories",
    update: (id: string) => `/categories/${id}`,
    delete: (id: string) => `/categories/${id}`,
  },
  dashboard: {
    overview: "/dashboard/overview",
    stats: "/dashboard/stats", 
    activity: "/dashboard/activity",
    events: "/dashboard/events",
    notifications: "/dashboard/notifications",
  },
  subscription: {
    invoices: '/v1/subscription/invoices',
    paymentMethod: '/v1/subscription/payment-method',
    create: '/v1/subscription/create',
    status: '/v1/subscription/status',
    paymentMethodUpdate: '/v1/subscription/payment-method/update',
    change: '/v1/subscription/change',
    cancel: '/v1/subscription/cancel',
    current: '/v1/subscription/current',
    // Subscription plans (admin)
    plans: '/v1/admin/subscription-plans',
    plan: (id: string) => `/v1/admin/subscription-plans/${id}`,
    // Subscription plans (public)
    publicPlans: '/v1/subscription-plans',
  }
};
