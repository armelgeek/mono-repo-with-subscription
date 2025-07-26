import { eq } from 'drizzle-orm'
import { IUseCase } from '@/domain/types'
import { ActivityType } from '@/infrastructure/config/activity.config'
import { db } from '@/infrastructure/database/db'
import { users } from '@/infrastructure/database/schema'
import { subscriptionPlans } from '@/infrastructure/database/schema/subscription-plan.schema'

export class GetSubscriptionStatusUseCase extends IUseCase<{ userId: string }, any> {
  async execute({ userId }: { userId: string }): Promise<any> {
    try {
      const result = await db
        .select({
          isTrialActive: users.isTrialActive,
          trialStartDate: users.trialStartDate,
          trialEndDate: users.trialEndDate,
          trialCanceled: users.trialCanceled,
          stripeSubscriptionId: users.stripeSubscriptionId,
          stripeCurrentPeriodEnd: users.stripeCurrentPeriodEnd,
          plan: {
            title: subscriptionPlans.name,
            maxChildren: subscriptionPlans.limit,
            description: subscriptionPlans.description
          }
        })
        .from(users)
        .leftJoin(subscriptionPlans, eq(users.planId, subscriptionPlans.id))
        .where(eq(users.id, userId))
        .then((rows) => rows[0])

      if (!result) {
        throw new Error('No subscription data found for user')
      }

      // Compute isCanceled and accessEndsAt
      let isCanceled = false
      let accessEndsAt = null
      if (result.trialCanceled && result.isTrialActive) {
        isCanceled = true
        accessEndsAt = result.trialEndDate
      } else if (!result.stripeSubscriptionId && result.stripeCurrentPeriodEnd) {
        // Stripe subscription canceled, access until end of paid period
        isCanceled = true
        accessEndsAt = result.stripeCurrentPeriodEnd
      }

      return {
        ...result,
        isCanceled,
        accessEndsAt
      }
    } catch (error) {
      console.error('[Get Stripe Status  Error]', error)
    }
  }
  log(): ActivityType {
    return ActivityType.GET_SUBSCRIBE_STATUS
  }
}
