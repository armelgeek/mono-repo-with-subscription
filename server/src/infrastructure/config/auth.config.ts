import { betterAuth, type User } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { emailOTP, openAPI,admin } from 'better-auth/plugins'

import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '../database/db'
import { users } from '../database/schema'
import {
  emailTemplates,
  sendChangeEmailVerification,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail
} from './mail.config'

export const auth = betterAuth({
  plugins: [
    openAPI(),
    emailOTP({
      expiresIn: 300,
      otpLength: 6,
      async sendVerificationOTP({ email, otp }) {
        const template = await emailTemplates.otpLogin(otp)
        await sendEmail({
          to: email,
          ...template
        })
      }
    }),
    admin()
  ],
  database: drizzleAdapter(db, {
    provider: 'pg'
  }),
  baseURL: Bun.env.BETTER_AUTH_URL || 'http://localhost:3000',
  trustedOrigins:
    Bun.env.NODE_ENV === 'production'
      ? ['http://localhost:5173']
      : [Bun.env.BETTER_AUTH_URL || 'http://localhost:3000', Bun.env.REACT_APP_URL || 'http://localhost:5173'],
  user: {
    modelName: 'users',
    additionalFields: {
      firstname: { type: 'string', default: '', returned: true },
      lastname: { type: 'string', default: '', returned: true },
      isAdmin: { type: 'boolean', default: false, returned: true },
      lastLoginAt: { type: 'date', default: null, returned: true },
      role: { type: 'string', default: 'user', returned: true },
      banned: { type: 'boolean', default: false, returned: true },
      banReason: { type: 'string', default: null, returned: true },
      banExpires: { type: 'date', default: null, returned: true },
      isTrialActive: { type: 'boolean', default: false, returned: true },
      trialStartDate: { type: 'date', default: null, returned: true },
      trialEndDate: { type: 'date', default: null, returned: true },
      stripeCustomerId: { type: 'string', default: '', returned: true },
      stripeSubscriptionId: { type: 'string', default: '', returned: true },
      stripePriceId: { type: 'string', default: '', returned: true },
      stripeCurrentPeriodEnd: { type: 'date', default: null, returned: true }
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ newEmail, token }) => {
        await sendChangeEmailVerification({
          email: newEmail,
          verificationUrl: token
        })
      }
    }
  },
  session: {
    modelName: 'sessions',
  },
  account: {
    modelName: 'accounts'
  },
  verification: {
    modelName: 'verifications'
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    requireEmailVerification: false,
    emailVerification: {
      sendVerificationEmail: async ({ user, token }: { user: User; token: string }) => {
        await sendVerificationEmail({
          email: user.email,
          verificationUrl: token
        })
      },
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      expiresIn: 3600 // 1 hour
    },
    sendResetPassword: async ({ user, token }) => {
      await sendResetPasswordEmail({
        email: user.email,
        verificationUrl: token
      })
    }
  }
})

const router = new Hono({
  strict: false
})

router.on(['POST', 'GET'], '/auth/*', async (c) => {
  const path = c.req.path
  const response = await auth.handler(c.req.raw)

  if (c.req.method === 'POST' && (path === '/api/auth/sign-in/email' || path === '/api/auth/sign-in/email-otp')) {
    try {
      const body = await response.text()
      const data = JSON.parse(body)

      if (data?.user?.id) {
        const now = new Date()
        await db
          .update(users)
          .set({
            lastLoginAt: now,
            updatedAt: now
          })
          .where(eq(users.id, data.user.id))
          .returning({ lastLoginAt: users.lastLoginAt })
      }

      return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      })
    } catch (error) {
      console.error('Failed to update last login date:', error)
    }
  }

  return response
})

export default router
