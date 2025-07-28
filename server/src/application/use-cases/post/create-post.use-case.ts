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

export class CreatePostUseCase extends IUseCase<Params, Response> {
  constructor(private readonly repository: PostRepositoryInterface) {
    super()
  }

  async execute(params: Params): Promise<Response> {
    try {
      const post = await this.repository.create(params)
      return { success: true, data: post }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  log(): ActivityType {
    return ActivityType.CREATE_POST
  }
}
