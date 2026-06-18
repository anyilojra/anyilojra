import { Resend } from "resend"
import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nevada.com"
const FROM_EMAIL = "Nevada <ventas@nevada.com>"

function buildEmailHtml({
  firstName,
  subject,
  body,
  buttonText,
  buttonUrl,
  unsubscribeToken,
}: {
  firstName: string
  subject: string
  body: string
  buttonText?: string
  buttonUrl?: string
  unsubscribeToken: string
}) {
  const unsubscribeUrl = `${SITE_URL}/api/newsletter/unsubscribe?token=${unsubscribeToken}`

  return `
  <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a0a00;background:#fff">

    <!-- Header dorado -->
    <div style="background:#c8952a;padding:28px 30px;text-align:center">
      <img
        src="${SITE_URL}/logo.svg"
        alt="Santizzima"
        width="70" height="70"
        style="display:block;margin:0 auto 12px;border-radius:50%;background:white;padding:4px"
      />
      <h1 style="color:white;margin:0;font-size:24px;letter-spacing:3px;font-family:Georgia,serif">
        SANTIZZIMA
      </h1>
      <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-style:italic;font-size:13px">
        Fe, Moda y Propósito
      </p>
    </div>

    <!-- Saludo -->
    <div style="background:#f5efe6;padding:24px 30px;border-bottom:2px solid #c8952a;text-align:center">
      <p style="color:#5c4a3a;margin:0;font-size:15px;line-height:1.6">
        Hola <strong style="color:#1a0a00">${firstName}</strong> 🌿
      </p>
      <h2 style="color:#1a0a00;margin:10px 0 0;font-size:20px;font-family:Georgia,serif">
        ${subject}
      </h2>
    </div>

    <!-- Cuerpo del mensaje -->
    <div style="padding:28px 30px;border-bottom:1px solid #f0e8db;line-height:1.8;font-size:14px;color:#1a0a00;white-space:pre-line">
      ${body}
    </div>

    <!-- Botón CTA (opcional) -->
    ${
      buttonText && buttonUrl
        ? `
    <div style="padding:28px 30px;text-align:center;border-bottom:1px solid #f0e8db">
      <a
        href="${buttonUrl}"
        style="display:inline-block;padding:14px 36px;background:#c8952a;color:white;text-decoration:none;font-size:13px;letter-spacing:2px;font-family:Georgia,serif"
      >
        ${buttonText.toUpperCase()}
      </a>
    </div>`
        : ""
    }

    <!-- Footer -->
    <div style="padding:20px 30px;text-align:center">
      <p style="color:#5c4a3a;font-size:12px;margin:0 0 4px">
        ventas@santizzima.com &nbsp;|&nbsp; +57 300 849 8089
      </p>
      <p style="color:#5c4a3a;font-size:12px;margin:0 0 14px">Bucaramanga, Colombia</p>
      <p style="color:#c8952a;font-size:13px;margin:0 0 16px;font-style:italic">
        ✦ Fe, Moda y Propósito ✦
      </p>
      <p style="font-size:11px;color:#9e8c7d;margin:0">
        No deseas recibir más correos?
        <a href="${unsubscribeUrl}" style="color:#9e8c7d;text-decoration:underline">
          Cancelar suscripción
        </a>
      </p>
    </div>

  </div>
  `
}

export async function POST(req: Request) {
  try {
    if (!resend) {
      return NextResponse.json({ ok: false, error: "Email service not configured" }, { status: 503 })
    }

    const body = await req.json()
    const { subject, message, buttonText, buttonUrl } = body

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Asunto y mensaje son requeridos." },
        { status: 400 }
      )
    }

    // Obtener todos los suscriptores activos
    const supabase = await createClient()
    const { data: subscribers, error: dbError } = await supabase
      .from("newsletter_subscribers")
      .select("id, first_name, email")
      .eq("subscribed", true)

    if (dbError) {
      return NextResponse.json({ ok: false, error: dbError.message }, { status: 500 })
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ ok: false, error: "No hay suscriptores activos." }, { status: 400 })
    }

    // Enviar en lotes de 50 para no saturar la API
    const BATCH_SIZE = 50
    let sent = 0
    let failed = 0

    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE)

      const emails = batch.map((sub) => ({
        from: FROM_EMAIL,
        to: sub.email,
        subject,
        html: buildEmailHtml({
          firstName: sub.first_name,
          subject,
          body: message,
          buttonText,
          buttonUrl,
          unsubscribeToken: Buffer.from(sub.id).toString("base64url"),
        }),
      }))

      const results = await resend.batch.send(emails)

      // Contar enviados vs fallidos
      if (results?.data) {
        sent += batch.length
      } else {
        failed += batch.length
      }
    }

    return NextResponse.json({
      ok: true,
      sent,
      failed,
      total: subscribers.length,
    })
  } catch (error: any) {
    console.error("Error enviando newsletter:", error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
