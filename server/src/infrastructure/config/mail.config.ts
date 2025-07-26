import nodemailer from 'nodemailer'
type EmailParams = {
  to: string
  subject: string
  text: string
}

const FROM_NAME = 'Demo'
const FROM_EMAIL = 'contact@demo.com'

const transporter = nodemailer.createTransport({
  host: Bun.env.SMTP_HOST,
  port: Number.parseInt(Bun.env.SMTP_PORT || '587'),
  secure: false,
  requireTLS: true,
  auth: {
    user: Bun.env.SMTP_USER,
    pass: Bun.env.SMTP_PASSWORD
  },
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000,
  tls: {
    rejectUnauthorized: false
  }
})

const SUBSCRIPTION_ACTION_URL = Bun.env.SUBSCRIPTION_ACTION_URL

export const emailTemplates = {
  trialStarted(name: string) {
    return {
      subject: "Bienvenue dans votre période d'essai Demo",
      text: `Bonjour ${name},

Nous sommes ravis de vous accueillir à Demo pour votre période d'essai gratuite.

Pendant ces prochains jours, vous aurez accès à l'ensemble de nos fonctionnalités premium. Profitez-en pour explorer notre plateforme et découvrir tout ce que nous pouvons vous offrir.

Pour gérer votre abonnement, visitez: ${SUBSCRIPTION_ACTION_URL}

Si vous avez des questions, n'hésitez pas à nous contacter.

Cordialement,
L'équipe Demo`
    }
  },

  trialEnding(name: string, daysLeft: number) {
    return {
      subject: "Votre période d'essai se termine bientôt",
      text: `Bonjour ${name},

Votre période d'essai Demo se termine dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}.

Pour continuer à bénéficier de nos services sans interruption, pensez à souscrire à un abonnement avant la fin de votre période d'essai.

Pour gérer votre abonnement: ${SUBSCRIPTION_ACTION_URL}

Nous restons à votre disposition pour toute question.

Cordialement,
L'équipe Demo`
    }
  },

  trialLastDay(name: string) {
    return {
      subject: "Dernier jour de votre période d'essai",
      text: `Bonjour ${name},

C'est le dernier jour de votre période d'essai Demo.

Pour éviter toute interruption de service, pensez à souscrire à un abonnement dès aujourd'hui.

Pour gérer votre abonnement: ${SUBSCRIPTION_ACTION_URL}

Nous restons à votre disposition pour toute question.

Cordialement,
L'équipe Demo`
    }
  },

  trialEnded(name: string) {
    return {
      subject: "Votre période d'essai est terminée",
      text: `Bonjour ${name},

Votre période d'essai Demo est maintenant terminée.

Nous espérons que vous avez apprécié notre plateforme. Pour continuer à utiliser nos services, souscrivez à un abonnement dès maintenant.

Pour gérer votre abonnement: ${SUBSCRIPTION_ACTION_URL}

Nous restons à votre disposition pour toute question.

Cordialement,
L'équipe Demo`
    }
  },

  subscriptionCreated(name: string, planName: string) {
    return {
      subject: 'Bienvenue dans votre abonnement Demo',
      text: `Bonjour ${name},

Merci d'avoir souscrit à notre formule ${planName}. Votre abonnement est maintenant actif.

Vous avez désormais accès à l'ensemble des fonctionnalités incluses dans votre abonnement.

Pour gérer votre abonnement: ${SUBSCRIPTION_ACTION_URL}

Nous restons à votre disposition pour toute question.

Cordialement,
L'équipe Demo`
    }
  },

  subscriptionCancelled(name: string) {
    return {
      subject: 'Annulation de votre abonnement Demo',
      text: `Bonjour ${name},

Nous confirmons l'annulation de votre abonnement Demo.

Vous continuerez à bénéficier de votre accès jusqu'à la fin de la période de facturation en cours.

Si vous changez d'avis, vous pouvez réactiver votre abonnement à tout moment: ${SUBSCRIPTION_ACTION_URL}

Nous espérons vous revoir bientôt.

Cordialement,
L'équipe Demo`
    }
  },

  paymentFailed(name: string) {
    return {
      subject: 'Échec du paiement de votre abonnement',
      text: `Bonjour ${name},

Nous n'avons pas pu traiter le paiement pour votre abonnement Demo.

Veuillez vérifier vos informations de paiement pour éviter toute interruption de service.

Pour mettre à jour vos informations de paiement: ${SUBSCRIPTION_ACTION_URL}/payment

Si vous avez besoin d'aide, n'hésitez pas à nous contacter.

Cordialement,
L'équipe Demo`
    }
  },

  paymentRetry(name: string, retryDate: Date) {
    const formattedDate = retryDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    return {
      subject: 'Nouvelle tentative de paiement prévue',
      text: `Bonjour ${name},

Suite à l'échec de traitement de votre paiement, une nouvelle tentative sera effectuée le ${formattedDate}.

Pour éviter tout problème, veuillez vérifier vos informations de paiement.

Pour mettre à jour vos informations de paiement: ${SUBSCRIPTION_ACTION_URL}/payment

Nous restons à votre disposition pour toute question.

Cordialement,
L'équipe Demo`
    }
  },

  subscriptionExpired(name: string) {
    return {
      subject: 'Votre abonnement a expiré',
      text: `Bonjour ${name},

Votre abonnement Demo a expiré et votre accès aux fonctionnalités premium a été suspendu.

Pour reprendre votre abonnement et retrouver l'accès à nos services:
${SUBSCRIPTION_ACTION_URL}

Nous espérons vous revoir bientôt.

Cordialement,
L'équipe Demo`
    }
  },

  deleteAccount(verificationUrl: string) {
    return {
      subject: 'Confirmation de suppression de compte',
      text: `Bonjour,

Nous avons reçu une demande de suppression de votre compte Demo.

Pour confirmer cette action, veuillez cliquer sur le lien suivant:
${verificationUrl}

Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer ce message et contacter notre support.

Ce lien expirera dans 24 heures.

Cordialement,
L'équipe Demo`
    }
  },

  verification(verificationUrl: string) {
    return {
      subject: 'Vérifiez votre adresse email',
      text: `Bonjour,

Merci de vous être inscrit à Demo. Pour finaliser votre inscription, veuillez vérifier votre adresse email en cliquant sur le lien suivant:
${verificationUrl}

Ce lien expirera dans 24 heures.

Cordialement,
L'équipe Demo`
    }
  },

  resetPassword(verificationUrl: string) {
    return {
      subject: 'Réinitialisation de votre mot de passe',
      text: `Bonjour,

Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Demo.

Pour créer un nouveau mot de passe, veuillez cliquer sur le lien suivant:
${verificationUrl}

Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer ce message.

Ce lien expirera dans 24 heures.

Cordialement,
L'équipe Demo`
    }
  },

  changeEmail(verificationUrl: string) {
    return {
      subject: "Vérification du changement d'email",
      text: `Bonjour,

Nous avons reçu une demande de changement d'adresse email pour votre compte Demo.

Pour confirmer cette nouvelle adresse email, veuillez cliquer sur le lien suivant:
${verificationUrl}

Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer ce message et contacter notre support.

Ce lien expirera dans 24 heures.

Cordialement,
L'équipe Demo`
    }
  },
  otpLogin(otpCode: string, name?: string) {
    return {
      subject: 'Code de connexion Demo',
      text: `Bonjour ${name ? name : ''},
        Voici votre code de connexion à usage unique pour Demo:
        
        ${otpCode}
          
        Ce code est valable pendant 10 minutes.
            
        Si vous n'avez pas demandé ce code, veuillez ignorer ce message.
          
        Cordialement,
        L'équipe Demo`
    }
  },
  paymentSucceeded(name: string) {
    return {
      subject: 'Paiement réussi pour votre abonnement Demo',
      text: `Bonjour ${name}, 
      Nous vous informons que votre paiement a été traité avec succès. Vous avez maintenant accès à toutes les fonctionnalités de votre abonnement.

      Nous vous remercions de votre confiance.

      Cordialement,
      L'équipe Demo`
    }
  }
}

export const sendEmail = async ({ to, subject, text }: EmailParams): Promise<any> => {
  const from = Bun.env.EMAIL_FROM || `${FROM_NAME} <${FROM_EMAIL}>`

  const mailOptions = {
    from,
    to,
    subject,
    text
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    return info
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export const sendVerificationEmail = ({ email, verificationUrl }: { email: string; verificationUrl: string }) => {
  const emailTemplate = emailTemplates.verification(verificationUrl)
  return sendEmail({
    to: email,
    ...emailTemplate
  })
}

export const sendResetPasswordEmail = ({ email, verificationUrl }: { email: string; verificationUrl: string }) => {
  const emailTemplate = emailTemplates.resetPassword(verificationUrl)
  return sendEmail({
    to: email,
    ...emailTemplate
  })
}

export const sendChangeEmailVerification = ({ email, verificationUrl }: { email: string; verificationUrl: string }) => {
  const emailTemplate = emailTemplates.changeEmail(verificationUrl)
  return sendEmail({
    to: email,
    ...emailTemplate
  })
}

export const sendDeleteAccountVerification = ({
  email,
  verificationUrl
}: {
  email: string
  verificationUrl: string
}) => {
  const emailTemplate = emailTemplates.deleteAccount(verificationUrl)
  return sendEmail({ to: email, ...emailTemplate })
}
