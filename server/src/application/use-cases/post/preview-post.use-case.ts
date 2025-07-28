import { IUseCase } from '../../../domain/types/use-case.type'
import { ActivityType } from '../../../infrastructure/config/activity.config'
import type { marked as MarkedType } from 'marked'

interface Params {
  content: string
}

interface Response {
  success: boolean
  html: string
}

export class PreviewPostUseCase extends IUseCase<Params, Response> {
  async execute(params: Params): Promise<Response> {
    try {
      const { marked } = (await import('marked')) as typeof import('marked')
      const html = await marked.parse(params.content)
      return { success: true, html }
    } catch {
      return { success: false, html: '' }
    }
  }

  log(): ActivityType {
    return ActivityType.PREVIEW_POST
  }
}
