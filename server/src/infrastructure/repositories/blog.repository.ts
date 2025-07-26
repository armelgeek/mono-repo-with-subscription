import { eq, sql } from 'drizzle-orm'
import { db } from '../database/db'
import { blog } from '../database/schema/blog'
import { blogCategories, categories } from '../database/schema/category'
import type {
  Blog,
  BlogCreate,
  BlogListResponse,
  BlogResponse,
  BlogUpdate,
  BlogWithCategories
} from '../../../../shared/src/types/blog'
import type { BlogRepository } from '../../domain/repositories/blog.repository'
import { BaseRepository } from './base.repository'

export class BlogRepositoryImpl extends BaseRepository<Blog, BlogCreate, BlogUpdate> implements BlogRepository {
  constructor() {
    super(blog)
  }

  protected transformToEntity(raw: any): Blog {
    return {
      ...raw,
      id: String(raw.id),
      createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : '',
      updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toISOString() : '',
      excerpt: raw.excerpt ?? undefined,
      tags: raw.tags ?? undefined,
      published: raw.published ?? undefined,
      status: (raw.status as 'draft' | 'published' | 'archived' | 'scheduled') ?? undefined,
      viewCount: raw.viewCount ?? undefined,
      readTime: raw.readTime ?? undefined,
      featuredImage: raw.featuredImage ?? undefined,
      publishedAt: raw.publishedAt ? new Date(raw.publishedAt).toISOString() : undefined,
      metaTitle: raw.metaTitle ?? undefined,
      metaDescription: raw.metaDescription ?? undefined,
      metaKeywords: raw.metaKeywords ?? undefined,
      ogImage: raw.ogImage ?? undefined,
      ogDescription: raw.ogDescription ?? undefined,
      contentType: (typeof raw.contentType === 'string' && ['markdown', 'html', 'rich-text'].includes(raw.contentType)
        ? raw.contentType
        : undefined) as 'markdown' | 'html' | 'rich-text' | undefined,
      isDraft: raw.isDraft ?? undefined,
      scheduledAt: raw.scheduledAt
        ? typeof raw.scheduledAt === 'string'
          ? raw.scheduledAt
          : raw.scheduledAt instanceof Date
            ? raw.scheduledAt.toISOString()
            : undefined
        : undefined,
      galleryImages: Array.isArray(raw.galleryImages)
        ? raw.galleryImages
        : typeof raw.galleryImages === 'string'
          ? [raw.galleryImages]
          : undefined,
      videoUrl: raw.videoUrl ?? undefined,
      audioUrl: raw.audioUrl ?? undefined
    }
  }

  protected transformForInsert(entity: BlogCreate): any {
    return {
      ...entity,
      createdAt: new Date(),
      updatedAt: new Date(),
      scheduledAt: typeof entity.scheduledAt === 'string' ? new Date(entity.scheduledAt) : (entity.scheduledAt ?? null)
    }
  }

  protected transformForUpdate(entity: BlogUpdate): any {
    return {
      ...entity,
      updatedAt: new Date(),
      scheduledAt: typeof entity.scheduledAt === 'string' ? new Date(entity.scheduledAt) : (entity.scheduledAt ?? null)
    }
  }
  async getAll(page = 1, limit = 10): Promise<BlogListResponse> {
    const result = await this.findAll(page, limit)
    return {
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    }
  }

  async getById(id: string): Promise<BlogResponse> {
    const data = await this.findById(id)
    if (!data) return { success: false, error: 'Not found' }
    return { success: true, data }
  }

  async create(data: BlogCreate): Promise<BlogResponse> {
    const created = await this.save(data)
    return { success: true, data: created }
  }

  // Implémentation de l'interface BlogRepository
  async update(id: string, data: BlogUpdate): Promise<BlogResponse> {
    const updated = await this.updateEntity(id, data)
    if (!updated) return { success: false, error: 'Not found' }
    return { success: true, data: updated }
  }

  async deleteById(id: string): Promise<BlogResponse> {
    const success = await this.remove(id)
    return { success }
  }

  async getByIdWithCategories(id: string): Promise<{ success: boolean; data?: BlogWithCategories }> {
    const result = await db
      .select({
        blog,
        categories
      })
      .from(blog)
      .leftJoin(blogCategories, eq(sql`${blog.id}::text`, blogCategories.blogId))
      .leftJoin(categories, eq(blogCategories.categoryId, sql`${categories.id}::text`))
      .where(eq(blog.id, Number(id)))

    if (result.length === 0) {
      return { success: false }
    }

    const blogData = result[0].blog
    const categoriesData = result
      .filter((row) => row.categories)
      .map((row) => ({
        id: String(row.categories!.id),
        name: row.categories!.name,
        slug: row.categories!.slug,
        description: row.categories!.description ?? undefined,
        color: row.categories!.color ?? undefined,
        createdAt: row.categories!.createdAt ? new Date(row.categories!.createdAt).toISOString() : '',
        updatedAt: row.categories!.updatedAt ? new Date(row.categories!.updatedAt).toISOString() : ''
      }))

    const blogWithCategories: BlogWithCategories = {
      id: String(blogData.id),
      title: blogData.title,
      slug: blogData.slug,
      content: blogData.content,
      excerpt: blogData.excerpt ?? undefined,
      authorId: blogData.authorId,
      tags: blogData.tags ?? undefined,
      published: blogData.published ?? undefined,
      status: (blogData.status as 'draft' | 'published' | 'archived' | 'scheduled') ?? undefined,
      viewCount: blogData.viewCount ?? undefined,
      readTime: blogData.readTime ?? undefined,
      featuredImage: blogData.featuredImage ?? undefined,
      publishedAt: blogData.publishedAt ? new Date(blogData.publishedAt).toISOString() : undefined,
      createdAt: blogData.createdAt ? new Date(blogData.createdAt).toISOString() : '',
      updatedAt: blogData.updatedAt ? new Date(blogData.updatedAt).toISOString() : '',
      categories: categoriesData
    }

    return { success: true, data: blogWithCategories }
  }

  async addCategoriesToBlog(blogId: string, categoryIds: string[]): Promise<BlogResponse> {
    await db.delete(blogCategories).where(eq(blogCategories.blogId, blogId))

    if (categoryIds.length > 0) {
      const categoryRelations = categoryIds.map((categoryId) => ({
        blogId,
        categoryId
      }))
      await db.insert(blogCategories).values(categoryRelations)
    }

    return { success: true }
  }

  async removeCategoriesFromBlog(blogId: string): Promise<BlogResponse> {
    await db.delete(blogCategories).where(eq(blogCategories.blogId, blogId))
    return { success: true }
  }
}
