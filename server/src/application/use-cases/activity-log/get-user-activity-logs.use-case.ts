import { IUseCase } from '@/domain/types/use-case.type'
import { ActivityType } from '@/infrastructure/config/activity.config'
import type { ActivityLog } from '@/domain/models/activity-log.model'
import type { ActivityLogRepositoryInterface } from '@/domain/repositories/activity-log.repository.interface'

export class GetUserActivityLogsUseCase extends IUseCase<
  { userId: string; limit?: number; skip?: number },
  { success: boolean; data: ActivityLog[]; error?: string }
> {
  constructor(private readonly repository: ActivityLogRepositoryInterface) {
    super()
  }

  async execute(params: { userId: string; limit?: number; skip?: number }) {
    try {
      const logs = await this.repository.findByUserId(params.userId, { limit: params.limit, skip: params.skip })
      return { success: true, data: logs }
    } catch (error: any) {
      return { success: false, data: [], error: error.message }
    }
  }

  log() {
    return (ActivityType as any).GET_USER_ACTIVITY_LOGS || 'GET_USER_ACTIVITY_LOGS'
  }
}
