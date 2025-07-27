import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { PermissionService } from '@/application/services/permission.service'
import { db } from '../database/db'
import { users } from '../database/schema'
import { UserRepository } from '../repositories/user.repository'
import type { Routes } from '../../domain/types'

export class UserController implements Routes {
  public controller: OpenAPIHono
  private userRepository: UserRepository
  private permissionService: PermissionService

  constructor() {
    this.controller = new OpenAPIHono()
    this.userRepository = new UserRepository()
    this.permissionService = new PermissionService()
  }

  public initRoutes() {
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/v1/users/session',
        tags: ['User'],
        summary: 'Retrieve the user session information',
        description: 'Retrieve the session info of the currently logged in user.',
        operationId: 'getUserSession',
        responses: {
          200: {
            description: 'Session information successfully retrieved',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean().openapi({
                    description: 'Indicates whether the operation was successful',
                    type: 'boolean',
                    example: true
                  }),
                  data: z.object({
                    user: z.object({
                      id: z.string().openapi({
                        description: 'User identifier',
                        type: 'string',
                        example: 'user_ABC123'
                      }),
                      name: z.string().openapi({
                        description: 'User name',
                        type: 'string',
                        example: 'Armel Wanes'
                      }),
                      email: z.string().openapi({
                        description: 'User email',
                        type: 'string',
                        example: 'armelgeek5@gmail.com'
                      }),
                      emailVerified: z.boolean().openapi({
                        description: 'User email verification status',
                        type: 'boolean',
                        example: false
                      }),
                      image: z.string().nullable().openapi({
                        description: 'User image URL',
                        type: 'string',
                        example: null
                      }),
                      createdAt: z.string().openapi({
                        description: 'User creation timestamp',
                        type: 'string',
                        example: '2025-05-06T16:34:49.937Z'
                      }),
                      updatedAt: z.string().openapi({
                        description: 'User update timestamp',
                        type: 'string',
                        example: '2025-05-06T16:34:49.937Z'
                      }),
                      isAdmin: z.boolean().openapi({
                        description: 'Flag indicating if the user has admin privileges',
                        type: 'boolean',
                        example: false
                      }),
                      c: z.boolean().openapi({
                        description: 'Flag indicating if the user has an active trial',
                        type: 'boolean',
                        example: false
                      }),
                      trialStartDate: z.string().nullable().openapi({
                        description: 'Trial start date',
                        type: 'string',
                        example: '2025-05-06T16:34:49.937Z'
                      }),
                      trialEndDate: z.string().nullable().openapi({
                        description: 'Trial end date',
                        type: 'string',
                        example: '2025-05-20T16:34:49.937Z'
                      })
                    })
                  })
                })
              }
            }
          }
        }
      }),
      (ctx: any) => {
        const user = ctx.get('user')
        if (!user) {
          return ctx.json({ error: 'Unauthorized' }, 401)
        }
        return ctx.json({ success: true, data: { user } })
      }
    )
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/v1/users',
        tags: ['User'],
        summary: 'List users',
        description:
          'Get a list of users with role filtering, search, and pagination support. Includes child count per user.',
        operationId: 'listUsers',
        request: {
          query: z.object({
            page: z
              .string()
              .transform(Number)
              .optional()
              .openapi({
                param: {
                  name: 'page',
                  in: 'query',
                  description: 'Page number for pagination',
                  schema: {
                    type: 'integer',
                    default: 1,
                    minimum: 1
                  }
                }
              }),
            limit: z
              .string()
              .transform(Number)
              .optional()
              .openapi({
                param: {
                  name: 'limit',
                  in: 'query',
                  description: 'Number of items per page',
                  schema: {
                    type: 'integer',
                    default: 10,
                    minimum: 1,
                    maximum: 100
                  }
                }
              }),
            search: z
              .string()
              .optional()
              .openapi({
                param: {
                  name: 'search',
                  in: 'query',
                  description: 'Search by name, firstname, or lastname',
                  schema: {
                    type: 'string'
                  }
                }
              })
          })
        },
        responses: {
          200: {
            description: 'List of users retrieved successfully',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  data: z.object({
                    users: z.array(
                      z.object({
                        id: z.string(),
                        name: z.string(),
                        firstname: z.string().optional(),
                        lastname: z.string().optional(),
                        email: z.string(),
                        emailVerified: z.boolean(),
                        image: z.string().optional(),
                        isAdmin: z.boolean(),
                        childrenCount: z.number(),
                        lastLogin: z.string().nullable(),
                        createdAt: z.string(),
                        updatedAt: z.string()
                      })
                    ),
                    total: z.number(),
                    page: z.number(),
                    limit: z.number()
                  })
                })
              }
            }
          },
          401: {
            description: 'Unauthorized - User must be authenticated',
            content: {
              'application/json': {
                schema: z.object({
                  error: z.string()
                })
              }
            }
          }
        }
      }),
      async (c: any) => {
        try {
          const query = c.req.valid('query')
          const currentUser = c.get('user')

          if (!currentUser) {
            return c.json({ error: 'Unauthorized' }, 401)
          }

          const result = await this.userRepository.findPaginatedUsers({
            page: query.page ? Number(query.page) : undefined,
            limit: query.limit ? Number(query.limit) : undefined,
            role: 'user',
            search: query.search
          })

          return c.json({
            success: true,
            data: result
          })
        } catch (error: any) {
          console.error('Error listing users:', error)
          return c.json(
            {
              success: false,
              error: error.message || 'Internal server error'
            },
            500
          )
        }
      }
    )
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/v1/admin/users',
        tags: ['Admin'],
        summary: 'List users with roles (excluding regular users)',
        description: 'Get a list of users who have specific roles assigned, excluding regular users.',
        request: {
          query: z.object({
            page: z
              .string()
              .transform(Number)
              .optional()
              .openapi({
                param: {
                  name: 'page',
                  in: 'query',
                  description: 'Page number for pagination',
                  schema: {
                    type: 'integer',
                    default: 1,
                    minimum: 1
                  }
                }
              }),
            limit: z
              .string()
              .transform(Number)
              .optional()
              .openapi({
                param: {
                  name: 'limit',
                  in: 'query',
                  description: 'Number of items per page',
                  schema: {
                    type: 'integer',
                    default: 10,
                    minimum: 1,
                    maximum: 100
                  }
                }
              }),
            search: z
              .string()
              .optional()
              .openapi({
                param: {
                  name: 'search',
                  in: 'query',
                  description: 'Search by name or email',
                  schema: {
                    type: 'string'
                  }
                }
              })
          })
        },
        responses: {
          200: {
            description: 'List of users with their roles and permissions',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  data: z.object({
                    data: z.array(
                      z.object({
                        id: z.string(),
                        name: z.string(),
                        email: z.string(),
                        roles: z.array(
                          z.object({
                            id: z.string(),
                            name: z.string(),
                            lastLoginAt: z.string().nullable(),
                            permissions: z.array(
                              z.object({
                                subject: z.string(),
                                actions: z.array(z.string())
                              })
                            )
                          })
                        )
                      })
                    ),
                    total: z.number(),
                    page: z.number(),
                    limit: z.number()
                  })
                })
              }
            }
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  error: z.string()
                })
              }
            }
          }
        }
      }),
      async (c: any) => {
        try {
          const query = c.req.valid('query')
          const currentUser = c.get('user')

          if (!currentUser && currentUser.role !== 'super_admin') {
            return c.json({ success: false, error: 'Unauthorized' }, 401)
          }

          const result = await this.userRepository.findPaginatedUsers({
            page: query.page,
            limit: query.limit,
            search: query.search,
            role: 'not_user'
          })

          const usersWithRoles = await Promise.all(
            result.users.map(async (user) => {
              const rolesWithPermissions = await this.permissionService.getUserRolesWithPermissions(user.id)

              const roles = rolesWithPermissions.reduce(
                (acc, role) => {
                  const existingRole = acc.find((r) => r.id === role.roleId)
                  if (existingRole) {
                    existingRole.permissions.push({
                      subject: role.resourceType ?? '',
                      actions: role.actions ?? []
                    })
                  } else {
                    acc.push({
                      id: role.roleId || '',
                      name: role.roleName || '',
                      permissions: [
                        {
                          subject: role.resourceType ?? '',
                          actions: role.actions ?? []
                        }
                      ]
                    })
                  }
                  return acc
                },
                [] as Array<{ id: string; name: string; permissions: Array<{ subject: string; actions: string[] }> }>
              )

              return {
                id: user.id,
                name: user.name,
                email: user.email,
                lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
                roles
              }
            })
          )

          return c.json({
            success: true,
            data: {
              data: usersWithRoles,
              total: result.total,
              page: result.page,
              limit: result.limit
            }
          })
        } catch (error: any) {
          console.error('Error listing users with roles:', error)
          return c.json(
            {
              success: false,
              error: error.message || 'Internal server error'
            },
            500
          )
        }
      }
    )

    this.controller.openapi(
      createRoute({
        method: 'post',
        path: '/v1/admin/users',
        tags: ['Admin'],
        summary: 'Create a new user with roles',
        description: 'Create a new user and assign specified roles to them.',
        request: {
          body: {
            content: {
              'application/json': {
                schema: z.object({
                  name: z.string().min(1),
                  email: z.string().email(),
                  roleIds: z.array(z.string().uuid()).min(1)
                })
              }
            }
          }
        },
        responses: {
          201: {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  data: z.object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string()
                  })
                })
              }
            }
          },
          400: {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  error: z.string()
                })
              }
            }
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  error: z.string()
                })
              }
            }
          }
        }
      }),
      async (c: any) => {
        try {
          const currentUser = c.get('user')
          if (!currentUser && currentUser.role !== 'super_admin') {
            return c.json({ success: false, error: 'Unauthorized' }, 401)
          }

          const { name, email, roleIds } = await c.req.json()

          const userId = crypto.randomUUID()
          await db.insert(users).values({
            id: userId,
            name,
            email,
            emailVerified: false,
            createdAt: new Date(),
            updatedAt: new Date()
          })

          for (const roleId of roleIds) {
            await this.permissionService.assignRoleToUser(userId, roleId)
          }

          return c.json(
            {
              success: true,
              data: {
                id: userId,
                name,
                email
              }
            },
            201
          )
        } catch (error: any) {
          console.error('Error creating user:', error)
          return c.json(
            {
              success: false,
              error: error.message || 'Internal server error'
            },
            500
          )
        }
      }
    )
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/v1/admin/roles',
        tags: ['Roles'],
        summary: 'List all available roles',
        description: 'Get a list of all available roles with their permissions.',
        responses: {
          200: {
            description: 'List of roles successfully retrieved',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  data: z.array(
                    z.object({
                      id: z.string(),
                      name: z.string(),
                      description: z.string(),
                      permissions: z.array(
                        z.object({
                          subject: z.string(),
                          actions: z.array(z.string())
                        })
                      ),
                      stats: z.object({
                        totalUsers: z.number(),
                        users: z.array(
                          z.object({
                            id: z.string(),
                            name: z.string(),
                            email: z.string()
                          })
                        )
                      })
                    })
                  )
                })
              }
            }
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  error: z.string()
                })
              }
            }
          }
        }
      }),
      async (c: any) => {
        try {
          const currentUser = c.get('user')
          if (!currentUser) {
            return c.json({ success: false, error: 'Unauthorized' }, 401)
          }

          const roles = await this.permissionService.getAllRolesWithDetails()

          return c.json({
            success: true,
            data: roles.map((role) => ({
              id: role.id,
              name: role.name,
              description: role.description || '',
              permissions: role.resources.map((resource: any) => ({
                subject: resource.resourceType,
                actions: resource.actions
              })),
              stats: {
                totalUsers: role.users.length,
                users: role.users
              }
            }))
          })
        } catch (error: any) {
          console.error('Error listing roles:', error)
          return c.json(
            {
              success: false,
              error: error.message || 'Internal server error'
            },
            500
          )
        }
      }
    )
  }
}
