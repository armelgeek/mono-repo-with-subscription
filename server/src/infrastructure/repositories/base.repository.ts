import process from 'node:process'
import { count, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

export interface BaseCreateEntity {
  createdAt?: string | Date
  updatedAt?: string | Date
}

export interface BaseUpdateEntity {
  updatedAt?: string | Date
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface SuccessResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export abstract class BaseRepository<
  TEntity extends BaseEntity,
  TCreateEntity extends BaseCreateEntity,
  TUpdateEntity extends BaseUpdateEntity
> {
  protected db: ReturnType<typeof drizzle>
  protected table: any

  constructor(table: any) {
    const connectionString = process.env.DATABASE_URL!
    const client = postgres(connectionString)
    this.db = drizzle(client)
    this.table = table
  }

  /**
   * Transform raw database row to domain entity
   * Override this method in child classes for custom transformations
   */
  protected transformToEntity(raw: any): TEntity {
    const transformed = {
      ...raw,
      id: String(raw.id),
      createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toISOString() : new Date().toISOString(),
      // Transform null to undefined for optional fields
      ...Object.keys(raw).reduce((acc, key) => {
        if (raw[key] === null) {
          acc[key] = undefined
        }
        return acc
      }, {} as any)
    } satisfies TEntity
    return transformed
  }

  /**
   * Transform domain entity for database insertion
   * Override this method in child classes for custom transformations
   */
  protected transformForInsert(entity: TCreateEntity): any {
    const now = new Date()
    return {
      ...entity,
      createdAt: entity.createdAt ? new Date(entity.createdAt) : now,
      updatedAt: entity.updatedAt ? new Date(entity.updatedAt) : now,
      // Transform undefined to null for database compatibility
      ...Object.keys(entity).reduce((acc, key) => {
        if ((entity as any)[key] === undefined) {
          acc[key] = null
        }
        return acc
      }, {} as any)
    }
  }

  /**
   * Transform domain entity for database update
   * Override this method in child classes for custom transformations
   */
  protected transformForUpdate(entity: TUpdateEntity): any {
    return {
      ...entity,
      updatedAt: new Date(),
      // Transform undefined to null for database compatibility
      ...Object.keys(entity).reduce((acc, key) => {
        if ((entity as any)[key] === undefined) {
          acc[key] = null
        }
        return acc
      }, {} as any)
    }
  }

  async findById(id: string): Promise<TEntity | null> {
    const result = await this.db
      .select()
      .from(this.table)
      .where(eq((this.table as any).id, Number(id)))
      .limit(1)

    if (!result.length) return null
    return this.transformToEntity(result[0])
  }

  async findAll(page: number = 1, limit: number = 10): Promise<PaginatedResponse<TEntity>> {
    const offset = (page - 1) * limit

    const [items, totalResult] = await Promise.all([
      this.db.select().from(this.table).limit(limit).offset(offset),
      this.db.select({ count: count() }).from(this.table)
    ])

    const total = totalResult[0].count
    const totalPages = Math.ceil(total / limit)

    return {
      data: items.map((item) => this.transformToEntity(item)),
      total,
      page,
      limit,
      totalPages
    }
  }

  async save(entity: TCreateEntity): Promise<TEntity> {
    const insertData = this.transformForInsert(entity)
    const result = await this.db.insert(this.table).values(insertData).returning()
    return this.transformToEntity(result[0])
  }

  protected async updateEntity(id: string, data: TUpdateEntity): Promise<TEntity | null> {
    const updateData = this.transformForUpdate(data)

    const result = await this.db
      .update(this.table)
      .set(updateData)
      .where(eq((this.table as any).id, Number(id)))
      .returning()

    if (!result.length) return null
    return this.transformToEntity(result[0])
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.db
      .delete(this.table)
      .where(eq((this.table as any).id, Number(id)))
      .returning()
    return result.length > 0
  }
}
