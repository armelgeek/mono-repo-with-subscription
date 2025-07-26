import { eq } from 'drizzle-orm'
import { IUseCase } from '@/domain/types'
import { ActivityType } from '@/infrastructure/config/activity.config'
import { stripe } from '@/infrastructure/config/stripe.config'
import { db } from '@/infrastructure/database/db'
import { subscriptionHistory, users } from '@/infrastructure/database/schema'
import { subscriptionPlans } from '@/infrastructure/database/schema/subscription-plan.schema'

type Params = {
  userId: string
  planId: string
  interval: 'month' | 'year'
}

type Response = {
  success: boolean
  error?: string
}

export class ChangeSubscriptionPlanUseCase extends IUseCase<Params, Response> {
  async execute({ userId, planId, interval }: Params): Promise<Response> {
    try {
      const userData = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .then((rows) => rows[0])

      if (!userData) {
        return { success: false, error: 'User not found' }
      }

      // Récupère le plan cible
      const plan = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, planId))
        .then((rows) => rows[0])
      if (!plan) {
        return { success: false, error: 'Subscription plan not found for this planId' }
      }

      // Récupère le priceId Stripe selon l'intervalle
      let priceId: string | undefined
      if (interval === 'month') priceId = plan.stripePriceIdMonthly ?? undefined
      else if (interval === 'year') priceId = plan.stripePriceIdYearly ?? undefined
      if (!priceId) {
        return { success: false, error: 'No Stripe priceId found for this interval' }
      }

      // Met à jour le planId de l'utilisateur
      await db.update(users).set({ planId: plan.id }).where(eq(users.id, userId))

      // Change l'abonnement Stripe
      const subscriptionId = userData.stripeSubscriptionId
      if (!subscriptionId || typeof subscriptionId !== 'string') {
        return { success: false, error: 'No active subscription found for the user' }
      }
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      if (!subscription) {
        return { success: false, error: 'Subscription not found' }
      }
      const quantity = interval === 'year' ? 12 : 1
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
        proration_behavior: 'create_prorations',
        items: [
          {
            id: subscription.items.data[0].id,
            price: priceId,
            quantity
          }
        ],
        metadata: {
          interval
        }
      })

      // Récupère la dernière facture générée (proration)
      let prorationAmount: string | null = null
      let adjustmentType: string = 'none'
      let prorationCurrency: string = 'eur'
      let invoiceUrl: string | null = null
      if (updatedSubscription.latest_invoice) {
        const invoice = await stripe.invoices.retrieve(updatedSubscription.latest_invoice as string)
        if (invoice && invoice.total !== undefined) {
          prorationAmount = String(invoice.total / 100)
          prorationCurrency = invoice.currency || 'eur'
          if (invoice.total > 0) adjustmentType = 'payment'
          else if (invoice.total < 0) adjustmentType = 'refund'
          invoiceUrl = invoice.hosted_invoice_url || null
        }
      }

      // Ajoute l'historique de changement
      await db.insert(subscriptionHistory).values({
        id: crypto.randomUUID(),
        userId,
        action: 'changed',
        oldPlan: userData.planId,
        newPlan: plan.name,
        amount: prorationAmount,
        currency: prorationCurrency,
        adjustmentType,
        interval,
        status: updatedSubscription.status,
        stripeInvoiceUrl: invoiceUrl,
        timestamp: new Date()
      })

      return { success: true }
    } catch (error) {
      console.error('[Change Plan Error]', error)
      return { success: false, error: 'Error changing plan' }
    }
  }

  log(): ActivityType {
    return ActivityType.CHANGE_SUBSCRIPTION_PLAN
  }
}
