import type { CategoryType } from '../models/category.model'

export interface CategoryRepositoryInterface {
  findById: (id: string) => Promise<CategoryType | null>
  findBySlug: (slug: string) => Promise<CategoryType | null>
  update: (id: string, data: Partial<CategoryType>) => Promise<CategoryType | null>
}
