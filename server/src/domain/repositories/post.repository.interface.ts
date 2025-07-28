import type { Post } from '../models/post.model'

export interface PostRepositoryInterface {
  findById: (id: number) => Promise<Post | null>
  findAll: (params?: {
    skip?: number
    limit?: number
    status?: string
    categoryId?: number
    tagId?: number
  }) => Promise<Post[]>
  create: (data: Omit<Post, 'id' | 'created_at' | 'updated_at'>) => Promise<Post>
  update: (id: number, data: Partial<Omit<Post, 'id' | 'created_at' | 'updated_at'>>) => Promise<Post>
  delete: (id: number) => Promise<boolean>
}
