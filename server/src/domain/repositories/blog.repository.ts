import type {
  BlogCreate,
  BlogListResponse,
  BlogResponse,
  BlogUpdate,
  BlogWithCategories
} from '../../../../shared/src/types/blog'

export interface BlogRepository {
  getAll: (page?: number, limit?: number) => Promise<BlogListResponse>
  getById: (id: string) => Promise<BlogResponse>
  getByIdWithCategories: (id: string) => Promise<{ success: boolean; data?: BlogWithCategories }>
  create: (data: BlogCreate) => Promise<BlogResponse>
  update: (id: string, data: BlogUpdate) => Promise<BlogResponse>
  deleteById: (id: string) => Promise<BlogResponse>
  addCategoriesToBlog: (blogId: string, categoryIds: string[]) => Promise<BlogResponse>
  removeCategoriesFromBlog: (blogId: string) => Promise<BlogResponse>
}
