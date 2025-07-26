export const API_ENDPOINTS = {
  endpoint: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api",
    version: "v1",
  },
  blog: {
    base: "/blogs",
    list: "/blogs",
    detail: (id: string) => `/blogs/${id}`,
    create: "/blogs",
    update: (id: string) => `/blogs/${id}`,
    delete: (id: string) => `/blogs/${id}`,
  },
  user: {
    list: "/users",
    detail: (id: string) => `/users/${id}`,
    byEmail: (email: string) => `/users/email/${email}`,
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
    session: "/v1/users/session",
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
  }
};
