import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import {
  CreateCategoryUseCase,
  DeleteCategoryUseCase,
  GetAllCategoriesUseCase,
  GetCategoryByIdUseCase,
  GetCategoryBySlugUseCase,
  UpdateCategoryUseCase
} from '@/application/use-cases/category'
import { CategoryRepositoryImpl } from '@/infrastructure/repositories/category.repository'
import type { Routes } from '@/domain/types/route.type'

export class CategoryController implements Routes {
  public controller: OpenAPIHono

  constructor() {
    this.controller = new OpenAPIHono()
    this.initRoutes()
  }

  private categoryRepo = new CategoryRepositoryImpl()
  private getAllCategories = new GetAllCategoriesUseCase(this.categoryRepo)
  private getCategoryById = new GetCategoryByIdUseCase(this.categoryRepo)
  private getCategoryBySlug = new GetCategoryBySlugUseCase(this.categoryRepo)
  private createCategory = new CreateCategoryUseCase(this.categoryRepo)
  private updateCategory = new UpdateCategoryUseCase(this.categoryRepo)
  private deleteCategory = new DeleteCategoryUseCase(this.categoryRepo)

  private CategorySchema = z.object({
    id: z.string().openapi({ example: 'cat_ABC123' }),
    name: z.string().openapi({ example: 'Technologie' }),
    slug: z.string().openapi({ example: 'technologie' }),
    description: z.string().optional().openapi({ example: 'Articles sur les nouvelles technologies' }),
    color: z.string().optional().openapi({ example: '#3B82F6' }),
    createdAt: z.string().openapi({ example: '2025-05-06T16:34:49.937Z' }),
    updatedAt: z.string().openapi({ example: '2025-05-06T16:34:49.937Z' })
  })
  private CreateCategorySchema = this.CategorySchema.omit({ id: true, createdAt: true, updatedAt: true })
  private UpdateCategorySchema = this.CreateCategorySchema.partial()

  public initRoutes() {
    // GET /categories
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/categories',
        tags: ['Categories'],
        summary: 'Get all categories',
        description: 'Récupère la liste paginée des catégories',
        operationId: 'getAllCategories',
        request: {
          query: z.object({
            page: z.string().optional(),
            limit: z.string().optional()
          })
        },
        responses: {
          200: {
            description: 'Liste des catégories',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  data: z
                    .object({
                      data: z.array(this.CategorySchema),
                      total: z.number(),
                      page: z.number(),
                      limit: z.number(),
                      totalPages: z.number()
                    })
                    .optional(),
                  error: z.string().optional()
                })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const page = Number(c.req.query('page') ?? '1')
        const limit = Number(c.req.query('limit') ?? '10')
        const result = await this.getAllCategories.execute(page, limit)
        return c.json(result)
      }
    )

    // GET /categories/:id
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/categories/:id',
        tags: ['Categories'],
        summary: 'Get category by ID',
        description: 'Récupère une catégorie par son identifiant',
        operationId: 'getCategoryById',
        request: {
          params: z.object({ id: z.string() })
        },
        responses: {
          200: {
            description: 'Catégorie par ID',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  data: this.CategorySchema.optional(),
                  error: z.string().optional()
                })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const id = c.req.param('id')
        const result = await this.getCategoryById.execute(id)
        return c.json(result)
      }
    )

    // GET /categories/slug/:slug
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/categories/slug/:slug',
        tags: ['Categories'],
        summary: 'Get category by slug',
        description: 'Récupère une catégorie par son slug',
        operationId: 'getCategoryBySlug',
        request: {
          params: z.object({ slug: z.string() })
        },
        responses: {
          200: {
            description: 'Catégorie par slug',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  data: this.CategorySchema.optional(),
                  error: z.string().optional()
                })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const slug = c.req.param('slug')
        const result = await this.getCategoryBySlug.execute(slug)
        return c.json(result)
      }
    )

    // POST /categories
    this.controller.openapi(
      createRoute({
        method: 'post',
        path: '/categories',
        tags: ['Categories'],
        summary: 'Create a new category',
        description: 'Crée une nouvelle catégorie',
        operationId: 'createCategory',
        request: {
          body: {
            content: {
              'application/json': {
                schema: this.CreateCategorySchema
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Catégorie créée',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  data: this.CategorySchema.optional(),
                  error: z.string().optional()
                })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const body = await c.req.json()
        const result = await this.createCategory.execute(body)
        return c.json(result)
      }
    )

    // PUT /categories/:id
    this.controller.openapi(
      createRoute({
        method: 'put',
        path: '/categories/:id',
        tags: ['Categories'],
        summary: 'Update a category',
        description: 'Met à jour une catégorie',
        operationId: 'updateCategory',
        request: {
          params: z.object({ id: z.string() }),
          body: {
            content: {
              'application/json': {
                schema: this.UpdateCategorySchema
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Catégorie mise à jour',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  data: this.CategorySchema.optional(),
                  error: z.string().optional()
                })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const id = c.req.param('id')
        const body = await c.req.json()
        const result = await this.updateCategory.execute(id, body)
        return c.json(result)
      }
    )

    this.controller.openapi(
      createRoute({
        method: 'delete',
        path: '/categories/:id',
        tags: ['Categories'],
        summary: 'Delete a category',
        description: 'Supprime une catégorie',
        operationId: 'deleteCategory',
        request: {
          params: z.object({ id: z.string() })
        },
        responses: {
          200: {
            description: 'Catégorie supprimée',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  data: z.any().optional(),
                  error: z.string().optional()
                })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const id = c.req.param('id')
        const result = await this.deleteCategory.execute(id)
        return c.json(result)
      }
    )
  }

  getRoutes() {
    return this.controller
  }
}
