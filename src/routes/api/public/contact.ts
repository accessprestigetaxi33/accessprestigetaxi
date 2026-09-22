import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { TEMPLATES } from '@/lib/email-templates/registry'

const TEMPLATE_NAME = 'contact-message'

const schema = z.object({
  nom: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  telephone: z.string().trim().max(30).optional().nullable(),
  sujet: z.string().trim().max(120).optional().nullable(),
  message: z.string().trim().min(10).max(2000),
})

export const Route = createFileRoute('/api/public/contact')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { getTaxiSupabaseAdmin } = await import('@/lib/taxi-supabase.server')
        const { sendTemplateEmail } = await import('@/lib/email-templates/send-email')

        let raw: unknown
        try { raw = await request.json() } catch {
          return Response.json({ error: 'Invalid JSON' }, { status: 400 })
        }
        const parsed = schema.safeParse(raw)
        if (!parsed.success) {
          return Response.json({ error: 'Invalid payload' }, { status: 400 })
        }
        const data = parsed.data

        const supabase = getTaxiSupabaseAdmin()
        const template = TEMPLATES[TEMPLATE_NAME]
        if (!template || !template.to) {
          return Response.json({ error: 'Template not configured' }, { status: 500 })
        }
        const recipient = template.to
        const messageId = crypto.randomUUID()

        // Envoi direct par Resend — plus de file d'attente externe.
        try {
          const result = await sendTemplateEmail(TEMPLATE_NAME, recipient, {
            templateData: data,
            replyTo: data.email,
            idempotencyKey: `contact-${messageId}`,
          })
          await supabase.from('email_send_log').insert({
            message_id: messageId,
            template_name: TEMPLATE_NAME,
            recipient_email: recipient,
            status: result.sent ? 'sent' : 'suppressed',
          })
          if (!result.sent) {
            return Response.json({ success: true, suppressed: true })
          }
        } catch (err) {
          console.error('[contact] send failed', err)
          await supabase.from('email_send_log').insert({
            message_id: messageId,
            template_name: TEMPLATE_NAME,
            recipient_email: recipient,
            status: 'failed',
            error_message: err instanceof Error ? err.message.slice(0, 500) : 'send failed',
          })
          return Response.json({ error: 'Send failed' }, { status: 500 })
        }

        return Response.json({ success: true })
      },
    },
  },
})
