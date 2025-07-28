import type { Tag } from '../models/tag.model'

export interface TagRepositoryInterface {
  findById: (id: number) => Promise<Tag | null>
  findAll: (params?: { skip?: number; limit?: number }) => Promise<Tag[]>
  create: (data: Omit<Tag, 'id' | 'created_at'>) => Promise<Tag>
  update: (id: number, data: Partial<Omit<Tag, 'id' | 'created_at'>>) => Promise<Tag>
  delete: (id: number) => Promise<boolean>
}
