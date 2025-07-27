import { and, eq, ilike, not, or, sql } from 'drizzle-orm'
import type { User } from '@/domain/models/user.model'
import type {
  PaginatedUsers,
  UserFilter,
  UserRepositoryInterface
} from '@/domain/repositories/user.repository.interface'
import { db } from '../database/db'

import { users } from '../database/schema'
import type { z } from 'zod'

export class UserRepository implements UserRepositoryInterface {
  async findById(id: string): Promise<z.infer<typeof User> | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id))

    if (!user) return null

    return {
      id: user.id,
      name: user.name,
      firstname: user.firstname || undefined,
      lastname: user.lastname || undefined,
      email: user.email,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt || null,
      image: user.image || undefined,
      isAdmin: user.isAdmin,
      isTrialActive: user.isTrialActive,
      hasUsedTrial: user.hasTrialUsed,
      trialStartDate: user.trialStartDate || undefined,
      trialEndDate: user.trialEndDate || undefined,
      stripeCustomerId: user.stripeCustomerId || undefined,
      stripeSubscriptionId: user.stripeSubscriptionId || undefined,
      planId: user.planId || undefined,
      stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd || undefined,
      banned: user.banned ?? false,
      banReason: user.banReason || undefined,
      banExpires: user.banExpires || undefined,
      impersonatedBy: user.impersonatedBy || undefined,
      role: user.role || 'user',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }

  async findAll(): Promise<z.infer<typeof User>[]> {
    const dbUsers = await db.select().from(users)

    return dbUsers.map((user) => ({
      id: user.id,
      name: user.name,
      firstname: user.firstname || undefined,
      lastname: user.lastname || undefined,
      email: user.email,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt || null,
      image: user.image || undefined,
      isAdmin: user.isAdmin,
      isTrialActive: user.isTrialActive,
      hasUsedTrial: user.hasTrialUsed,
      trialStartDate: user.trialStartDate || undefined,
      trialEndDate: user.trialEndDate || undefined,
      stripeCustomerId: user.stripeCustomerId || undefined,
      stripeSubscriptionId: user.stripeSubscriptionId || undefined,
      planId: user.planId || undefined,
      stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd || undefined,
      banned: user.banned ?? false,
      banReason: user.banReason || undefined,
      banExpires: user.banExpires || undefined,
      impersonatedBy: user.impersonatedBy || undefined,
      role: user.role || 'user',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }))
  }

  async findPaginatedUsers(filter: UserFilter): Promise<PaginatedUsers> {
    const page = filter.page || 1
    const limit = filter.limit || 10
    const offset = (page - 1) * limit

    const conditions = []

    const baseQuery = db.select().from(users)

    if (filter.role) {
      if (filter.role === 'not_user') {
        conditions.push(not(eq(users.role, 'user')))
      } else {
        conditions.push(eq(users.role, filter.role))
      }
    }

    if (filter.search) {
      conditions.push(
        or(
          ilike(users.name, `%${filter.search}%`),
          ilike(users.firstname || '', `%${filter.search}%`),
          ilike(users.lastname || '', `%${filter.search}%`)
        )
      )
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined
    const query = whereClause ? baseQuery.where(whereClause) : baseQuery

    const [{ count }] = await db
      .select({
        count: sql<number>`count(${users.id})::int`
      })
      .from(query.as('filtered_users'))

    const total = count

    const results = await query.orderBy(users.createdAt).limit(limit).offset(offset)

    const mappedUsers = results.map((user) => {
      return {
        id: user.id,
        name: user.name,
        firstname: user.firstname || undefined,
        lastname: user.lastname || undefined,
        email: user.email,
        emailVerified: user.emailVerified,
        lastLoginAt: user.lastLoginAt || null,
        image: user.image || undefined,
        isAdmin: user.isAdmin,
        isTrialActive: user.isTrialActive,
        hasUsedTrial: user.hasTrialUsed,
        trialStartDate: user.trialStartDate || undefined,
        trialEndDate: user.trialEndDate || undefined,
        stripeCustomerId: user.stripeCustomerId || undefined,
        stripeSubscriptionId: user.stripeSubscriptionId || undefined,
        planId: user.planId || undefined,
        stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd || undefined,
        banned: user.banned ?? false,
        banReason: user.banReason || undefined,
        banExpires: user.banExpires || undefined,
        impersonatedBy: user.impersonatedBy || undefined,
        role: user.role || 'user',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })

    return {
      users: mappedUsers,
      total,
      page,
      limit
    }
  }

  async findByEmail(email: string): Promise<z.infer<typeof User> | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email))

    if (!user) return null

    return {
      id: user.id,
      name: user.name,
      firstname: user.firstname || undefined,
      lastname: user.lastname || undefined,
      email: user.email,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt || null,
      image: user.image || undefined,
      isAdmin: user.isAdmin,
      isTrialActive: user.isTrialActive,
      hasUsedTrial: user.hasTrialUsed,
      trialStartDate: user.trialStartDate || undefined,
      trialEndDate: user.trialEndDate || undefined,
      stripeCustomerId: user.stripeCustomerId || undefined,
      stripeSubscriptionId: user.stripeSubscriptionId || undefined,
      planId: user.planId || undefined,
      stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd || undefined,
      banned: user.banned ?? false,
      banReason: user.banReason || undefined,
      banExpires: user.banExpires || undefined,
      impersonatedBy: user.impersonatedBy || undefined,
      role: user.role || 'user',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }
}
