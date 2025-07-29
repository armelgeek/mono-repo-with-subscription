import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { z } from 'zod'
import { AutoSavePostUseCase } from '../../application/use-cases/post/auto-save-post.use-case'
import { CreatePostUseCase } from '../../application/use-cases/post/create-post.use-case'
import { PreviewPostUseCase } from '../../application/use-cases/post/preview-post.use-case'
import { UpdatePostUseCase } from '../../application/use-cases/post/update-post.use-case'
import { PostSchema } from '../../domain/models/post.model'
import { PostRepository } from '../repositories/post.repository'

export class PostController {
  public controller: OpenAPIHono
  private postRepository: PostRepository

  constructor() {
    this.controller = new OpenAPIHono()
    this.postRepository = new PostRepository()
    this.initRoutes()
  }

  public initRoutes() {
    // Create post
    this.controller.openapi(
      createRoute({
        method: 'post',
        path: '/v1/posts',
        tags: ['Posts'],
        summary: 'Créer un article',
        request: {
          body: {
            content: {
              'application/json': {
                schema: PostSchema.omit({
                  id: true,
                  author_id: true,
                  category_id: true,
                  created_at: true,
                  updated_at: true
                })
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Article créé',
            content: {
              'application/json': {
                schema: z.object({ success: z.boolean(), data: PostSchema })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const user = c.get('user')
        if (!user) {
          return c.json({ success: false, error: 'Unauthorized' }, 401)
        }
        const useCase = new CreatePostUseCase(this.postRepository)
        const body = await c.req.json()
        const result = await useCase.execute({
          ...body,
          author_id: user.id
        })
        return c.json(result, result.success ? 201 : 400)
      }
    )

    // Update post
    this.controller.openapi(
      createRoute({
        method: 'put',
        path: '/v1/posts/{id}',
        tags: ['Posts'],
        summary: 'Mettre à jour un article',
        request: {
          params: z.object({ id: z.number() }),
          body: {
            content: {
              'application/json': {
                schema: PostSchema.omit({ id: true, created_at: true, updated_at: true })
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Article mis à jour',
            content: {
              'application/json': {
                schema: z.object({ success: z.boolean(), data: PostSchema })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const useCase = new UpdatePostUseCase(this.postRepository)
        const { id } = c.req.param()
        const body = await c.req.json()
        const result = await useCase.execute({ id: Number(id), ...body })
        return c.json(result, result.success ? 200 : 400)
      }
    )

    // Auto-save (draft)
    this.controller.openapi(
      createRoute({
        method: 'post',
        path: '/v1/posts/auto-save',
        tags: ['Posts'],
        summary: 'Sauvegarde automatique du brouillon',
        request: {
          body: {
            content: {
              'application/json': {
                schema: PostSchema.omit({ id: true, created_at: true, updated_at: true })
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Brouillon sauvegardé',
            content: {
              'application/json': {
                schema: z.object({ success: z.boolean(), data: PostSchema })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const useCase = new AutoSavePostUseCase(this.postRepository)
        const body = await c.req.json()
        const result = await useCase.execute(body)
        return c.json(result, result.success ? 200 : 400)
      }
    )

    // Preview (markdown -> HTML)
    this.controller.openapi(
      createRoute({
        method: 'post',
        path: '/v1/posts/preview',
        tags: ['Posts'],
        summary: 'Prévisualisation markdown',
        request: {
          body: {
            content: {
              'application/json': {
                schema: z.object({ content: z.string() })
              }
            }
          }
        },
        responses: {
          200: {
            description: 'HTML généré',
            content: {
              'application/json': {
                schema: z.object({ success: z.boolean(), html: z.string() })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const useCase = new PreviewPostUseCase()
        const { content } = await c.req.json()
        const result = await useCase.execute({ content })
        return c.json(result, result.success ? 200 : 400)
      }
    )
  }
}
