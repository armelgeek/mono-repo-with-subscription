"use client"

import { createApiService } from '@/shared/lib/admin/admin-generator';
import { API_ENDPOINTS } from '@/shared/config/api';
import type { User } from './user.schema';

export const userService = createApiService<User>(API_ENDPOINTS.user.list);
