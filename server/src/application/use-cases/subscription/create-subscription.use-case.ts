import { eq } from 'drizzle-orm'
import { IUseCase } from '@/domain/types'
import { ActivityType } from '@/infrastructure/config/activity.config'
import { FREE_TRIAL_DAYS, stripe } from '@/infrastructure/config/stripe.config'
import { db } from '@/infrastructure/database/db'
import { users } from '@/infrastructure/database/schema'
import { subscriptionPlans } from '@/infrastructure/database/schema/subscription-plan.schema'
type CreateSubscriptionParams = {
  userId: string
  planId: string
  interval: 'month' | 'year'
  successUrl: string
  cancelUrl: string
}
type CreateSubscriptionResponse = {
  success: boolean
  sessionId?: string
  paymentUrl?: string
  error?: string
}
export class CreateSubscriptionUseCase extends IUseCase<CreateSubscriptionParams, CreateSubscriptionResponse> {
  async execute({
    userId,
    planId,
    interval,
    successUrl,
    cancelUrl
  }: CreateSubscriptionParams): Promise<CreateSubscriptionResponse> {
    try {
      const userData = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .then((rows) => rows[0])

      if (!userData) {
        return { success: false, error: 'User not found' }
      }

      let customerId = userData.stripeCustomerId
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: userData.email,
          name: userData.name
        })
        customerId = customer.id
        await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, userId))
      }

      let plan = null
      let priceId = null
      let quantity = 1
      if (interval === 'month') {
        plan = await db
          .select()
          .from(subscriptionPlans)
          .where(eq(subscriptionPlans.id, planId))
          .then((rows) => rows[0])
        priceId = plan?.stripePriceIdMonthly
        quantity = 1
      } else if (interval === 'year') {
        plan = await db
          .select()
          .from(subscriptionPlans)
          .where(eq(subscriptionPlans.id, planId))
          .then((rows) => rows[0])
        priceId = plan?.stripePriceIdYearly
        quantity = 12
      }
      if (!plan || !priceId) {
        return { success: false, error: 'Subscription plan not found for this interval' }
      }

      // Calcule le nombre de jours de trial à afficher (sans modifier l'état backend)
      let trialDays = 0
      if (
        !userData.hasTrialUsed &&
        userData.isTrialActive &&
        userData.trialEndDate &&
        userData.trialEndDate > new Date()
      ) {
        trialDays = Math.ceil((userData.trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      } else if (!userData.hasTrialUsed) {
        trialDays = FREE_TRIAL_DAYS
      }
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer: customerId,
        line_items: [
          {
            price: priceId,
            quantity
          }
        ],
        metadata: {
          userId,
          planId: plan.id,
          interval
        },
        subscription_data: trialDays > 0 ? { trial_period_days: trialDays } : {},
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl
      })

      return { success: true, sessionId: session.id, paymentUrl: session.url ?? undefined }
    } catch (error) {
      console.error('[Stripe Checkout Error]', error)
      return { success: false, error: 'Error occured' }
    }
  }
  log(): ActivityType {
    return ActivityType.SUBSCRIBING
  }
}
