import { createApiService } from '@/shared/lib/admin/admin-generator';
import { API_ENDPOINTS } from '@/shared/config/api';

export const categoryService = createApiService(API_ENDPOINTS.category.base);
