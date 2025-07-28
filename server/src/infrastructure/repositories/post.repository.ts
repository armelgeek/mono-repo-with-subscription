import { and, eq } from 'drizzle-orm'
import { db } from '../database/db'
import { post } from '../database/schema'
import type { Post } from '../../domain/models/post.model'
import type { PostRepositoryInterface } from '../../domain/repositories/post.repository.interface'

export class PostRepository implements PostRepositoryInterface {
  async findById(id: number): Promise<Post | null> {
    const result = await db.query.post.findFirst({
      where: eq(post.id, id)
    })
    return result ? this.mapToPost(result) : null
  }

  async findAll(params?: {
    skip?: number
    limit?: number
    status?: string
    categoryId?: number
    tagId?: number
  }): Promise<Post[]> {
    const whereClauses = []
    if (params?.status) whereClauses.push(eq(post.status, params.status))
    if (params?.categoryId) whereClauses.push(eq(post.category_id, params.categoryId))
    // TODO: gérer le filtrage par tagId via une jointure si besoin
    const results = await db.query.post.findMany({
      where: whereClauses.length ? and(...whereClauses) : undefined,
      offset: params?.skip,
      limit: params?.limit
    })
    return results.map(this.mapToPost)
  }

  async create(data: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<Post> {
    const [created] = await db.insert(post).values(data).returning()
    return this.mapToPost(created)
  }

  async update(id: number, data: Partial<Omit<Post, 'id' | 'created_at' | 'updated_at'>>): Promise<Post> {
    const [updated] = await db.update(post).set(data).where(eq(post.id, id)).returning()
    return this.mapToPost(updated)
  }

  async delete(id: number): Promise<boolean> {
    const deleted = await db.delete(post).where(eq(post.id, id)).returning()
    return !!deleted.length
  }

  private mapToPost(row: any): Post {
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      content: row.content,
      excerpt: row.excerpt,
      status: row.status,
      is_featured: row.is_featured,
      view_count: row.view_count,
      author_id: row.author_id,
      category_id: row.category_id,
      created_at: row.created_at,
      updated_at: row.updated_at
      // Ajoutez ici les autres champs optionnels si nécessaires (ex: published_at, cover_url, etc.)
    }
  }
}
