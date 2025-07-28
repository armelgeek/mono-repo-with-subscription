import type { Comment } from '../models/comment.model'

export interface CommentRepositoryInterface {
  findById: (id: number) => Promise<Comment | null>
  findAll: (params?: { skip?: number; limit?: number; postId?: number; status?: string }) => Promise<Comment[]>
  create: (data: Omit<Comment, 'id' | 'created_at' | 'updated_at'>) => Promise<Comment>
  update: (id: number, data: Partial<Omit<Comment, 'id' | 'created_at' | 'updated_at'>>) => Promise<Comment>
  delete: (id: number) => Promise<boolean>
}
