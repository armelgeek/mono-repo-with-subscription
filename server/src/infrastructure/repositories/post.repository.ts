import type { Post } from '../../domain/models/post.model'
import type { IPostRepository } from '../../domain/repositories/post.repository.interface'

export class PostRepository implements IPostRepository {
  async findById(id: number) {
    return null
  }

  async findAll(params?: {
    skip?: number
    limit?: number
    status?: string
    categoryId?: number
    tagId?: number
  }) {
    return []
  }

  async create(data: Omit<Post, 'id' | 'created_at' | 'updated_at'>) {
    // @ts-expect-error stub
    return {} as Post
  }

  async update(id: number, data: Partial<Omit<Post, 'id' | 'created_at' | 'updated_at'>>) {
    // @ts-expect-error stub
    return {} as Post
  }

  async delete(id: number) {
    return true
  }
}
