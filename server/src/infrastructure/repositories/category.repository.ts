import { eq, isNull, sql } from 'drizzle-orm'
import type { CategoryType } from '@/domain/models/category.model'
import type { CategoryRepositoryInterface } from '@/domain/repositories/category.repository.interface'
import { categories } from '../database/schema/category'
import { BaseRepository } from './base.repository'

interface CategoryCreateData {
  name: string
  slug: string
  description?: string
  color?: string
  createdAt?: string | Date
  updatedAt?: string | Date
}

interface CategoryUpdateData {
  name?: string
  slug?: string
  description?: string
  color?: string
  updatedAt?: string | Date
}

export class CategoryRepositoryImpl
  extends BaseRepository<CategoryType, CategoryCreateData, CategoryUpdateData>
  implements CategoryRepositoryInterface
{
  constructor() {
    super(categories)
  }

  async findBySlug(slug: string): Promise<CategoryType | null> {
    const result = await this.db.select().from(categories).where(eq(categories.slug, slug)).limit(1)
    if (!result.length) return null
    return this.transformToEntity(result[0])
  }

  // Implémentation de l'interface CategoryRepositoryInterface
  async update(id: string, data: Partial<CategoryType>): Promise<CategoryType | null> {
    return await this.updateEntity(id, data as CategoryUpdateData)
  }

  async softDelete(id: string): Promise<boolean> {
    const now = new Date()
    const result = await this.db
      .update(categories)
      .set({ deletedAt: now })
      .where(eq(categories.id, Number(id)))
    // drizzle-orm update returns array of updated rows, not rowCount
    return Array.isArray(result) ? result.length > 0 : !!result
  }

  async restore(id: string): Promise<boolean> {
    const result = await this.db
      .update(categories)
      .set({ deletedAt: null })
      .where(eq(categories.id, Number(id)))
    return Array.isArray(result) ? result.length > 0 : !!result
  }

  async findAllActive(
    page = 1,
    limit = 10
  ): Promise<{ data: CategoryType[]; total: number; page: number; limit: number; totalPages: number }> {
    const offset = (page - 1) * limit
    const [items, [{ count }]] = await Promise.all([
      this.db.select().from(categories).where(isNull(categories.deletedAt)).limit(limit).offset(offset),
      this.db
        .select({ count: sql`count(*)::int` })
        .from(categories)
        .where(isNull(categories.deletedAt))
    ])
    const total = Number(count) || 0
    const totalPages = Math.ceil(total / limit)
    return {
      data: items.map(this.transformToEntity),
      total,
      page,
      limit,
      totalPages
    }
  }
}
