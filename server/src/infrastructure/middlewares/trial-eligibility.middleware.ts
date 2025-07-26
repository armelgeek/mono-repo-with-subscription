import { eq } from 'drizzle-orm'
import { db } from '@/infrastructure/database/db'
import { users } from '@/infrastructure/database/schema'
import type { MiddlewareHandler } from 'hono'

/**
 * Middleware: Vérifie l'éligibilité à l'activation du trial.
 * Refuse si l'utilisateur est admin/super_admin ou a déjà utilisé le trial.
 */
export const trialEligibilityMiddleware: MiddlewareHandler = async (c, next) => {
  const userId = c.get('userId') // dépend de ton système d'auth
  if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401)

  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!user) return c.json({ success: false, error: 'User not found' }, 404)

  // Rôles non concernés
  if (['admin', 'super_admin'].includes(user.role)) return next()

  // Déjà utilisé le trial
  if (user.hasTrialUsed) {
    return c.json({ success: false, error: 'Vous avez déjà bénéficié de la période d’essai.' }, 403)
  }

  return next()
}
