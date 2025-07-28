import { IUseCase } from '../../../domain/types/use-case.type'
import { ActivityType } from '../../../infrastructure/config/activity.config'
import type { Post } from '../../../domain/models/post.model'
import type { PostRepositoryInterface } from '../../../domain/repositories/post.repository.interface'

interface Params extends Partial<Omit<Post, 'created_at' | 'updated_at'>> {
  id: number
}

interface Response {
  success: boolean
  data?: Post
  error?: string
}

export class UpdatePostUseCase extends IUseCase<Params, Response> {
  constructor(private readonly repository: PostRepositoryInterface) {
    super()
  }

  async execute(params: Params): Promise<Response> {
    try {
      const post = await this.repository.update(params.id, params)
      return { success: true, data: post }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  log(): ActivityType {
    return ActivityType.UPDATE_POST
  }
}
