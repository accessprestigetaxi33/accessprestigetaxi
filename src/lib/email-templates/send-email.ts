import * as React from 'react'
import { render } from '@react-email/render'
import { EmailAPIError, sendLovableEmail } from '@lovable.dev/email-js'
import { TEMPLATES } from './registry'

// Server-only: reads LOVABLE_API_KEY. Never import from client components.

// Configuration baked in at scaffold time
const SITE_NAME = "Access Prestige Taxi"
// SENDER_DOMAIN is the verified sender subdomain FQDN (e.g., "notify.example.com").
// It MUST match the subdomain delegated to Lovable's nameservers. NEVER use the root domain.
const SENDER_DOMAIN = "notify.accessprestigetaxi.fr"
// FROM_DOMAIN is the domain shown in the From: header. Must match the domain
// verified in Resend (accessprestigetaxi.fr) — subdomains are rejected.
const FROM_DOMAIN = process.env["MAIL_FROM_DOMAIN"] ?? "accessprestigetaxi.fr"

export type SendTemplateEmailResult =
  | { sent: true }
  | { sent: false; reason: 'recipient_suppressed' }

export interface SendTemplateEmailOptions {
  templateData?: Record<string, any>
  /** Dedupes retries of the same logical send; defaults to a random UUID (no dedupe). */
  idempotencyKey?: string
  replyTo?: string
}

/**
 * Renders a registered template and sends it through Lovable's managed email
 * API. Suppression, retries, and rate limits are enforced by Lovable
 * server-side. A suppressed recipient is an expected outcome
 * ({ sent: false }); any other failure throws — EmailAPIError exposes
 * .code and .status for branching.
 */
export async function sendTemplateEmail(
  templateName: string,
  to: string,
  options: SendTemplateEmailOptions = {}
): Promise<SendTemplateEmailResult> {
  const template = TEMPLATES[templateName]
  if (!template) {
    throw new Error(
      `Template '${templateName}' not found. Available: ${Object.keys(TEMPLATES).join(', ')}`
    )
  }

  // Template-level `to` takes precedence — notification templates always
  // send to their fixed address.
  const recipient = template.to || to
  if (!recipient) {
    throw new Error('Recipient is required (the template defines no fixed recipient)')
  }

  const templateData = options.templateData ?? {}
  const element = React.createElement(template.component, templateData)
  const html = await render(element)
  const text = await render(element, { plainText: true })
  const subject =
    typeof template.subject === 'function'
      ? template.subject(templateData)
      : template.subject

  const from = `${SITE_NAME} <noreply@${FROM_DOMAIN}>`

  // 1) Chemin principal : Resend (compte du client, indépendant de Lovable).
  const resendKey = process.env['RESEND_API_KEY']
  if (resendKey) {
    try {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendKey}`,
          // Évite les doublons quand un tick réessaie le même envoi.
          ...(options.idempotencyKey ? { 'Idempotency-Key': options.idempotencyKey } : {}),
        },
        body: JSON.stringify({
          from,
          to: [recipient],
          subject,
          html,
          text,
          reply_to: options.replyTo,
        }),
      })
      if (resp.ok) return { sent: true }
      const body = await resp.text().catch(() => '')
      if (resp.status === 403 && /suppress/i.test(body)) {
        return { sent: false, reason: 'recipient_suppressed' }
      }
      console.error(`[send-email] Resend failed [${resp.status}]: ${body}`)
    } catch (error) {
      console.error('[send-email] Resend error', error)
    }
  }

  // 2) Repli : API e-mail managée Lovable (outil de développement uniquement).
  const apiKey = process.env['LOVABLE_API_KEY']
  if (!apiKey) {
    throw new Error('Email delivery unavailable: RESEND_API_KEY failed and LOVABLE_API_KEY is not configured')
  }

  try {
    await sendLovableEmail(
      {
        to: recipient,
        from,
        sender_domain: SENDER_DOMAIN,
        subject,
        html,
        text,
        purpose: 'transactional',
        label: templateName,
        idempotency_key: options.idempotencyKey || crypto.randomUUID(),
        reply_to: options.replyTo,
      },
      { apiKey, sendUrl: process.env['LOVABLE_SEND_URL'] }
    )
  } catch (error) {
    if (error instanceof EmailAPIError && error.code === 'recipient_suppressed') {
      return { sent: false, reason: 'recipient_suppressed' }
    }
    throw error
  }

  return { sent: true }
}

