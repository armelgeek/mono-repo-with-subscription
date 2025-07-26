import { and, eq, isNull, lt } from 'drizzle-orm'
import { emailTemplates, sendEmail } from '@/infrastructure/config/mail.config'
import { db } from '@/infrastructure/database/db'
import { users } from '@/infrastructure/database/schema'

/**
 * Scheduler: Désactive les trials expirés et envoie l'email de fin d'essai.
 * À exécuter via cron (ex: toutes les heures).
 */
export async function runTrialExpiryScheduler() {
  const now = new Date()
  // Sélectionne tous les utilisateurs avec trial actif, trialCanceled, trialEndDate dépassée et pas d'abonnement Stripe
  const expiredTrials = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.isTrialActive, true),
        eq(users.trialCanceled, true),
        lt(users.trialEndDate, now),
        isNull(users.stripeSubscriptionId)
      )
    )

  // Rappel J-1 : trial se termine demain
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const lastDayTrials = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.isTrialActive, true),
        eq(users.trialEndDate, new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()))
      )
    )

  for (const user of lastDayTrials) {
    if (user.email && user.name) {
      const emailTemplate = emailTemplates.trialLastDay(user.name)
      await sendEmail({
        to: user.email,
        ...emailTemplate
      })
      console.info(`[TrialScheduler] Last day trial reminder sent to user ${user.id}`)
    }
  }

  // Rappel J-2/J-3 : trial se termine dans 2 ou 3 jours
  for (const daysLeft of [2, 3]) {
    const targetDate = new Date(now.getTime() + daysLeft * 24 * 60 * 60 * 1000)
    const endingTrials = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.isTrialActive, true),
          eq(users.trialEndDate, new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()))
        )
      )

    for (const user of endingTrials) {
      if (user.email && user.name) {
        const emailTemplate = emailTemplates.trialEnding(user.name, daysLeft)
        await sendEmail({
          to: user.email,
          ...emailTemplate
        })
        console.info(`[TrialScheduler] Trial ending reminder (${daysLeft} days left) sent to user ${user.id}`)
      }
    }
  }

  for (const user of expiredTrials) {
    await db.update(users).set({ isTrialActive: false }).where(eq(users.id, user.id))

    // Envoi de l'email de fin d'essai
    if (user.email && user.name) {
      const emailTemplate = emailTemplates.trialEnded(user.name)
      await sendEmail({
        to: user.email,
        ...emailTemplate
      })
      console.info(`[TrialScheduler] Trial ended for user ${user.id}, email sent.`)
    }
  }
}
