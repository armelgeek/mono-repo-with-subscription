import { Buffer } from 'node:buffer'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { CancelSubscriptionUseCase } from '@/application/use-cases/subscription/cancel-subscription.use-case'
import { ChangeSubscriptionPlanUseCase } from '@/application/use-cases/subscription/change-subscription.use-case'
import { CreateSubscriptionUseCase } from '@/application/use-cases/subscription/create-subscription.use-case'
import { GetSubscriptionStatusUseCase } from '@/application/use-cases/subscription/get-subscription-status.use-case'
import { HandleStripeWebhookUseCase } from '@/application/use-cases/subscription/handle-stripe-webhook.use-case'
import type { Routes } from '@/domain/types'
import { stripe } from '../config/stripe.config'

export class SubscriptionController implements Routes {
  public controller: OpenAPIHono

  constructor() {
    this.controller = new OpenAPIHono()
    this.initRoutes()
  }

  public initRoutes() {
    // GET /v1/subscription/invoices
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/v1/subscription/invoices',
        tags: ['Subscription'],
        summary: 'Get Stripe invoice history for current user',
        description:
          'Returns Stripe invoices (period, payment date, amount, status, invoice URL) for the current user.',
        security: [{ Bearer: [] }],
        responses: {
          200: {
            description: 'Invoice history',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  data: z.array(
                    z.object({
                      id: z.string(),
                      periodStart: z.string(),
                      periodEnd: z.string(),
                      amount: z.number(),
                      currency: z.string(),
                      status: z.string(),
                      paidAt: z.string().nullable(),
                      invoiceUrl: z.string().nullable()
                    })
                  ),
                  error: z.string().optional()
                })
              }
            }
          },
          400: {
            description: 'Bad request',
            content: {
              'application/json': {
                isExpired: z.boolean(),
                schema: z.object({ success: z.boolean(), error: z.string() })
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
        const stripeCustomerId = user.stripeCustomerId
        if (!stripeCustomerId) {
          return c.json({ success: false, error: 'No Stripe customer found' }, 404)
        }
        try {
          const invoices = await stripe.invoices.list({ customer: stripeCustomerId, limit: 30 })
          // Filtrer les factures payées et montant > 0
          const filtered = invoices.data.filter(
            (inv: any) => inv.status === 'paid' && typeof inv.total === 'number' && inv.total > 0
          )
          const data = await Promise.all(
            filtered.map(async (inv: any) => {
              let planName = null
              if (inv.subscription) {
                try {
                  const subscription = await stripe.subscriptions.retrieve(inv.subscription)
                  planName = subscription.items.data[0]?.price?.nickname || null
                  const productId =
                    typeof subscription.items.data[0]?.price?.product === 'string'
                      ? subscription.items.data[0].price.product
                      : null
                  if (!planName && productId) {
                    const product = await stripe.products.retrieve(productId)
                    planName = product.name
                  }
                } catch {}
              }
              return {
                id: inv.id,
                planName,
                periodStart: inv.period_start ? new Date(inv.period_start * 1000).toISOString() : null,
                periodEnd: inv.period_end ? new Date(inv.period_end * 1000).toISOString() : null,
                amount: typeof inv.total === 'number' ? inv.total / 100 : 0,
                currency: inv.currency,
                status: inv.status,
                interval: inv.lines.data[0]?.plan?.interval || null,
                paidAt: inv.status === 'paid' && inv.paid_at ? new Date(inv.paid_at * 1000).toISOString() : null,
                invoiceUrl: inv.hosted_invoice_url || null
              }
            })
          )
          return c.json({ success: true, data })
        } catch (error: any) {
          return c.json({ success: false, error: error.message })
        }
      }
    )
    // GET /v1/subscription/payment-method
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/v1/subscription/payment-method',
        tags: ['Subscription'],
        summary: 'Get Stripe payment method info for current user',
        description:
          'Returns masked card info (brand, last4, exp_month, exp_year, etc.) for the current Stripe payment method.',
        security: [{ Bearer: [] }],
        responses: {
          200: {
            description: 'Payment method info',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  data: z
                    .object({
                      brand: z.string(),
                      last4: z.string(),
                      expMonth: z.number(),
                      expYear: z.number(),
                      funding: z.string(),
                      country: z.string().nullable()
                    })
                    .nullable(),
                  error: z.string().optional()
                })
              }
            }
          },
          404: {
            description: 'No payment method found',
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
        const user = c.get('user')
        if (!user) {
          return c.json({ success: false, error: 'Unauthorized' }, 401)
        }
        try {
          // Get Stripe customer ID from user
          const stripeCustomerId = user.stripeCustomerId
          if (!stripeCustomerId) {
            return c.json({ success: false, error: 'No Stripe customer found' }, 404)
          }
          // List payment methods
          const paymentMethods = await stripe.paymentMethods.list({
            customer: stripeCustomerId,
            type: 'card'
          })
          if (!paymentMethods.data.length) {
            return c.json({ success: false, error: 'No payment method found', data: null }, 404)
          }
          // Use the first card (default)
          const card = paymentMethods.data[0].card
          if (!card) {
            return c.json({ success: false, error: 'No card info found', data: null }, 404)
          }
          const info = {
            brand: card.brand,
            last4: card.last4,
            expMonth: card.exp_month,
            expYear: card.exp_year,
            funding: card.funding,
            country: card.country || null
          }
          return c.json({ success: true, data: info })
        } catch (error: any) {
          return c.json({ success: false, error: error.message, data: null }, 400)
        }
      }
    )
    this.controller.openapi(
      createRoute({
        method: 'post',
        path: '/v1/subscription/create',
        tags: ['Subscription'],
        summary: 'Create Stripe subscription',
        description: 'Create a new subscription for a user.',
        security: [{ Bearer: [] }],

        request: {
          body: {
            content: {
              'application/json': {
                schema: z.object({
                  planId: z.string(),
                  interval: z.enum(['month', 'year']),
                  successUrl: z.string(),
                  cancelUrl: z.string()
                })
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Subscription checkout session created',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  sessionId: z.string()
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
          }
        }
      }),
      async (c: any) => {
        const user = c.get('user')
        if (!user) {
          return c.json({ success: false, error: 'Unauthorized' }, 401)
        }

        const { planId, interval, successUrl, cancelUrl } = await c.req.json()

        const createSubscriptionUseCase = new CreateSubscriptionUseCase()
        const result = await createSubscriptionUseCase.execute({
          userId: user.id,
          planId,
          interval,
          successUrl,
          cancelUrl
        })

        if (result.success) {
          return c.json({
            success: true,
            sessionId: result.sessionId,
            paymentUrl: result.paymentUrl
          })
        } else {
          return c.json({ success: false, error: result.error }, 400)
        }
      }
    )
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/v1/subscription/status',
        tags: ['Subscription'],
        summary: 'Get subscription status',
        description: 'Get the current subscription status and details for a user',
        security: [{ Bearer: [] }],
        responses: {
          200: {
            description: 'Subscription details retrieved successfully',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  data: z.object({
                    isTrialActive: z.boolean(),
                    trialStartDate: z.string().nullable(),
                    trialEndDate: z.string().nullable(),
                    plan: z.object({
                      title: z.string(),
                      description: z.string(),
                      benefits: z.array(z.string()),
                      isPaid: z.boolean(),
                      interval: z.enum(['month', 'year']).nullable(),
                      isCanceled: z.boolean()
                    })
                  })
                })
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

        const getSubscriptionStatusUseCase = new GetSubscriptionStatusUseCase()
        try {
          const subscription = await getSubscriptionStatusUseCase.execute({ userId: user.id })
          return c.json({
            success: true,
            data: {
              ...subscription,
              isCanceled: subscription.isCanceled,
              accessEndsAt: subscription.accessEndsAt
            }
          })
        } catch (error: any) {
          return c.json({ success: false, error: error.message }, 400)
        }
      }
    )

    this.controller.openapi(
      createRoute({
        method: 'post',
        path: '/v1/subscription/payment-method/update',
        tags: ['Subscription'],
        summary: 'Open Stripe billing portal for card modification',
        description: 'Returns a Stripe billing portal session URL for the user to update their payment method/card.',
        security: [{ Bearer: [] }],
        request: {
          body: {
            content: {
              'application/json': {
                schema: z.object({
                  returnUrl: z.string().optional()
                })
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Billing portal session created',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  url: z.string().optional(),
                  error: z.string().optional()
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
          }
        }
      }),
      async (c: any) => {
        const user = c.get('user')
        if (!user) {
          return c.json({ success: false, error: 'Unauthorized' }, 401)
        }
        const { returnUrl } = await c.req.json()
        try {
          const stripeCustomerId = user.stripeCustomerId
          if (!stripeCustomerId) {
            return c.json({ success: false, error: 'No Stripe customer found' }, 404)
          }

          const session = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: returnUrl
          })
          return c.json({ success: true, url: session.url })
        } catch (error: any) {
          let message = error.message || 'Stripe error'
          if (error.raw && error.raw.message) message = error.raw.message
          return c.json({ success: false, error: message }, 400)
        }
      }
    )
    this.controller.openapi(
      createRoute({
        method: 'post',
        path: '/stripe/webhook',
        tags: ['Subscription'],
        summary: 'Stripe Webhook',
        description: 'Handle Stripe webhook events.',
        operationId: 'stripeWebhook',
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean()
                })
              }
            }
          }
        }
      }),
      async (ctx: any) => {
        const sig = ctx.req.header('stripe-signature')
        // Stripe attend un Buffer, pas un string !
        const rawBody = Buffer.from(await ctx.req.raw.arrayBuffer())
        try {
          const event = await stripe.webhooks.constructEventAsync(rawBody, sig!, Bun.env.STRIPE_WEBHOOK_SECRET!)

          const handleStripeWebhookUseCase = new HandleStripeWebhookUseCase()
          const result = await handleStripeWebhookUseCase.execute({ event })

          if (result.success) {
            return ctx.json({ success: true })
          } else {
            return ctx.json({ success: false }, 400)
          }
        } catch (error) {
          console.error('[Stripe Webhook Error]', error)
          return ctx.json({ success: false, error: 'Webhook Error' }, 400)
        }
      }
    )
    this.controller.openapi(
      createRoute({
        method: 'post',
        path: '/v1/subscription/change',
        tags: ['Subscription'],
        summary: 'Change subscription plan',
        description: 'Change the current subscription plan for the user.',
        security: [{ Bearer: [] }],
        request: {
          body: {
            content: {
              'application/json': {
                schema: z.object({
                  planId: z.string(),
                  interval: z.enum(['month', 'year'])
                })
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Subscription plan changed successfully',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean()
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
          }
        }
      }),
      async (c: any) => {
        const user = c.get('user')
        if (!user) {
          return c.json({ success: false, error: 'Unauthorized' }, 401)
        }

        const { planId, interval } = await c.req.json()

        const changeSubscriptionPlanUseCase = new ChangeSubscriptionPlanUseCase()
        try {
          const result = await changeSubscriptionPlanUseCase.execute({
            userId: user.id,
            planId,
            interval
          })

          if (result.success) {
            return c.json({ success: true })
          } else {
            return c.json({ success: false, error: result.error }, 400)
          }
        } catch (error: any) {
          return c.json({ success: false, error: error.message }, 400)
        }
      }
    )

    this.controller.openapi(
      createRoute({
        method: 'post',
        path: '/v1/subscription/cancel',
        tags: ['Subscription'],
        summary: 'Cancel subscription',
        description: 'Cancel the current subscription of the user.',
        security: [{ Bearer: [] }],
        responses: {
          200: {
            description: 'Subscription canceled successfully',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean()
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
          }
        }
      }),
      async (c: any) => {
        const user = c.get('user')
        if (!user) {
          return c.json({ success: false, error: 'Unauthorized' }, 401)
        }

        const cancelSubscriptionUseCase = new CancelSubscriptionUseCase()
        try {
          const result = await cancelSubscriptionUseCase.execute({
            userId: user.id
          })

          if (result.success) {
            return c.json({ success: true })
          } else {
            return c.json({ success: false, error: result.error }, 400)
          }
        } catch (error: any) {
          return c.json({ success: false, error: error.message }, 400)
        }
      }
    )
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/v1/subscription/current',
        tags: ['Subscription'],
        summary: 'Get current subscription info for user',
        description: 'Returns the current subscription plan, max children allowed, active until, and trial info.',
        security: [{ Bearer: [] }],
        responses: {
          200: {
            description: 'Current subscription info',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  data: z.object({
                    planId: z.string().optional(),
                    planName: z.string(),
                    maxLimit: z.number(),
                    activeUntil: z.string().nullable(),
                    isTrial: z.boolean(),
                    currentChildrenCount: z.number(),
                    trialEndDate: z.string().nullable(),
                    trialDaysLeft: z.number().nullable()
                  }),
                  error: z.string().optional()
                })
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
        try {
          const getSubscriptionStatusUseCase = new GetSubscriptionStatusUseCase()
          const sub = await getSubscriptionStatusUseCase.execute({ userId: user.id })
          if (!sub) {
            return c.json({ success: false, error: 'No subscription found' }, 404)
          }
          const planName = sub.plan?.title
          const maxLimit = sub.plan?.maxLimit || 1
          const isTrial = sub.isTrialActive || false

          let activeUntil = null
          let trialEndDate = null
          let trialDaysLeft = null
          if (isTrial && sub.trialEndDate) {
            activeUntil = sub.trialEndDate
            trialEndDate = sub.trialEndDate
            const now = new Date()
            const trialEnd = new Date(sub.trialEndDate)
            trialDaysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          } else if (!isTrial && sub.accessEndsAt) {
            activeUntil = sub.accessEndsAt
            trialEndDate = null
          }

          if (sub.stripeCurrentPeriodEnd) {
            activeUntil = sub.stripeCurrentPeriodEnd
            trialEndDate = null
          }
          // Gestion du cancel : accès jusqu'à la fin de la période, puis expiration
          let isExpired = false
          const now = new Date()
          let endDate = null
          if (isTrial && trialEndDate) {
            endDate = new Date(trialEndDate)
          } else if (activeUntil) {
            endDate = new Date(activeUntil)
          }
          // Si abonnement annulé, accès jusqu'à la fin de la période
          if (sub.isCanceled && endDate) {
            isExpired = endDate.getTime() < now.getTime()
          } else if (endDate) {
            isExpired = endDate.getTime() < now.getTime()
          } else {
            isExpired = true
          }

          return c.json({
            success: true,
            data: {
              planId: sub.plan?.id || undefined,
              planName,
              maxLimit,
              interval: sub.plan?.interval || null,
              activeUntil,
              isTrial,
              trialEndDate,
              trialDaysLeft,
              isExpired,
              isCanceled: sub.isCanceled,
              accessEndsAt: sub.accessEndsAt
            }
          })
        } catch (error: any) {
          return c.json({ success: false, error: error.message })
        }
      }
    )
  }
}
