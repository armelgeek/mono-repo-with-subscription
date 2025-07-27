import type { ActivityLog } from '../models/activity-log.model'

export interface ActivityLogRepositoryInterface {
  findByUserId: (userId: string, options?: { limit?: number; skip?: number }) => Promise<ActivityLog[]>
  create: (data: Omit<ActivityLog, 'id' | 'createdAt'>) => Promise<ActivityLog>
}
