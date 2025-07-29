import { API_ENDPOINTS } from '@/shared/config/api';
import { createApiService } from '@/shared/lib/admin/admin-generator';
import type { Blog, BlogCreate, BlogUpdate, BlogResponse, BlogListResponse, BlogWithCategories } from '../../../shared/src/types/blog';
import { BaseServiceImpl } from '@/shared/domain/base.service';
import BaseService from '@/shared/lib/services/base-service';

export class BlogService extends BaseServiceImpl<Blog, BlogCreate> {
  protected endpoints = {
    base: API_ENDPOINTS.blog.list,
    list: (qs: string) => `${API_ENDPOINTS.blog.list}${qs ? `?${qs}` : ''}`,
    create: API_ENDPOINTS.blog.create,
    detail: (id: string) => API_ENDPOINTS.blog.detail(id),
    update: (id: string) => API_ENDPOINTS.blog.update(id),
    delete: (id: string) => API_ENDPOINTS.blog.delete(id),
  };

  protected serializeParams(filter: Record<string, unknown>): string {
    const params = new URLSearchParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) params.append(key, String(value));
    });
    return params.toString();
  }

  async getAll(page = 1, limit = 10): Promise<BlogListResponse> {
    return this.get<BlogListResponse>(`${API_ENDPOINTS.blog.list}?page=${page}&limit=${limit}`);
  }

  async getById(id: string): Promise<BlogResponse> {
    return this.get<BlogResponse>(API_ENDPOINTS.blog.detail(id));
  }

  async getByIdWithCategories(id: string): Promise<{ success: boolean; data?: BlogWithCategories }> {
    return this.get<{ success: boolean; data?: BlogWithCategories }>(`${API_ENDPOINTS.blog.detail(id)}/with-categories`);
  }

  async create(data: BlogCreate): Promise<{ message: string; status: number; data: Blog }> {
    const res = await this.post<BlogResponse>(API_ENDPOINTS.blog.create, data);
    return {
      message: res.success ? 'Blog créé' : res.error || 'Erreur',
      status: res.success ? 200 : 400,
      data: res.data as Blog,
    };
  }

  async update(id: string, data: BlogUpdate): Promise<{ message: string; status: number; data: Blog }> {
    const res = await this.put<BlogResponse>(API_ENDPOINTS.blog.update(id), data);
    return {
      message: res.success ? 'Blog mis à jour' : res.error || 'Erreur',
      status: res.success ? 200 : 400,
      data: res.data as Blog,
    };
  }

  async deleteById(id: string): Promise<BlogResponse> {
    return this.delete<BlogResponse>(API_ENDPOINTS.blog.delete(id));
  }

  async addCategoriesToBlog(blogId: string, categoryIds: string[]): Promise<BlogResponse> {
    return this.post<BlogResponse>(`${API_ENDPOINTS.blog.detail(blogId)}/categories`, { categoryIds });
  }

  async removeCategoriesFromBlog(blogId: string): Promise<BlogResponse> {
    return this.delete<BlogResponse>(`${API_ENDPOINTS.blog.detail(blogId)}/categories`);
  }
}

export const blogService = new BlogService();

export const blogAdminService = createApiService(API_ENDPOINTS.blog.base);

export const postService = new BaseService('');
