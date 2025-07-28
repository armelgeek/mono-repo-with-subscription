import { IUseCase } from '../../../domain/types/use-case.type'
import { ActivityType } from '../../../infrastructure/config/activity.config'
import type { Post } from '../../../domain/models/post.model'
import type { PostRepositoryInterface } from '../../../domain/repositories/post.repository.interface'

interface Params extends Omit<Post, 'id' | 'created_at' | 'updated_at'> {}

interface Response {
  success: boolean
  data?: Post
  error?: string
}

export class AutoSavePostUseCase extends IUseCase<Params, Response> {
  constructor(private readonly repository: PostRepositoryInterface) {
    super()
  }

  async execute(params: Params): Promise<Response> {
    try {
      // On peut marquer le post comme "draft" ou "autosave"
      const post = await this.repository.create({ ...params, status: 'draft' })
      return { success: true, data: post }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  log(): ActivityType {
    return ActivityType.AUTO_SAVE_POST
  }
}
