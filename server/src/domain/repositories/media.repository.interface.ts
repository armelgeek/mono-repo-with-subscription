import type { Media } from '../models/media.model'

export interface MediaRepositoryInterface {
  findById: (id: number) => Promise<Media | null>
  findAll: (params?: { skip?: number; limit?: number }) => Promise<Media[]>
  create: (data: Omit<Media, 'id' | 'created_at'>) => Promise<Media>
  update: (id: number, data: Partial<Omit<Media, 'id' | 'created_at'>>) => Promise<Media>
  delete: (id: number) => Promise<boolean>
}
