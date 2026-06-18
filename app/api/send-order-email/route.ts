import { Resend } from "resend"
import { NextResponse } from "next/server"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nevada.com"
const FROM_EMAIL = "Nevada <ventas@nevada.com>"

function formatPrice(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n)
}

const EVENT_CONFIG: Record<string, { subject: string; title: string; message: string; emoji: string }> = {
  order_created: {
    subject: "Pedido recibido 🌿",
    title: "¡Pedido recibido con éxito!",
    message: "Hemos recibido tu pedido. En cuanto confirmemos tu pago, comenzaremos a prepararlo.",
    emoji: "🛍️",
  },
  payment_confirmed: {
    subject: "Pago confirmado ✅",
    title: "¡Tu pago fue confirmado!",
    message: "Tu pago ha sido verificado y tu pedido está siendo preparado con mucho amor. 🙏",
    emoji: "✅",
  },
  shipped: {
    subject: "Tu pedido va en camino 🚚",
    title: "¡Tu pedido está en camino!",
    message: "Tu pedido ha sido despachado y pronto llegará a tus manos. Puedes hacer seguimiento con tu código.",
    emoji: "🚚",
  },
  delivered: {
    subject: "Pedido entregado 🎉",
    title: "¡Tu pedido fue entregado!",
    message: "Esperamos que lo disfrutes mucho. Gracias por confiar en Santizzima. ✨",
    emoji: "🎉",
  },
}

function buildEmailHtml({
  customerName,
  shortId,
  items,
  total,
  event,
}: {
  customerName: string
  shortId: string
  items: { product_name: string; product_image?: string; quantity: number; price: number; size?: string }[]
  total: number
  event: string
}) {
  const firstName = customerName.split(" ")[0]
  const trackingUrl = `${SITE_URL}/seguimiento?id=${shortId}`
  const cfg = EVENT_CONFIG[event] ?? EVENT_CONFIG.order_created

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #f0e8db;font-size:13px;color:#1a0a00;vertical-align:middle">
        <div style="display:flex;gap:10px;align-items:center">
          ${item.product_image ? `<img src="${item.product_image}" alt="${item.product_name}" style="width:50px;height:50px;object-fit:cover;border-radius:4px;display:block"/>` : `<div style="width:50px;height:50px;background:#f0e8db;border-radius:4px;flex-shrink:0"></div>`}
          <div style="flex:1">
            <strong>${item.product_name || "Sin nombre"}</strong>${item.size ? `<br/><span style="color:#8b7355;font-size:11px">Talla: ${item.size}</span>` : ""}
          </div>
        </div>
      </td>
      <td style="padding:12px;border-bottom:1px solid #f0e8db;font-size:13px;text-align:center;vertical-align:middle">${item.quantity}</td>
      <td style="padding:12px;border-bottom:1px solid #f0e8db;font-size:13px;text-align:right;vertical-align:middle">${formatPrice(item.price * item.quantity)}</td>
    </tr>`).join("")

  return `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a0a00;background:#fff">
    <div style="background:#c8952a;padding:28px 30px;text-align:center">
      <img src="${SITE_URL}/logo.svg" alt="Nevada" width="70" height="70" style="display:block;margin:0 auto 12px;border-radius:50%;background:white;padding:4px"/>
      <h1 style="color:white;margin:0;font-size:24px;letter-spacing:3px">NEVADA</h1>
      <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-style:italic;font-size:13px">Chaquetas y Ovejeras</p>
    </div>
    <div style="background:#f5efe6;padding:24px 30px;border-bottom:2px solid #c8952a;text-align:center">
      <p style="font-size:32px;margin:0">${cfg.emoji}</p>
      <p style="color:#5c4a3a;margin:8px 0 0;font-size:15px">Hola <strong>${firstName}</strong></p>
      <h2 style="color:#1a0a00;margin:10px 0 4px;font-size:20px">${cfg.title}</h2>
      <p style="color:#5c4a3a;margin:4px 0 0;font-size:13px">Pedido <strong>#${shortId}</strong></p>
    </div>
    <div style="padding:20px 30px;border-bottom:1px solid #f0e8db;text-align:center">
      <p style="color:#5c4a3a;font-size:14px;line-height:1.7;margin:0">${cfg.message}</p>
    </div>
    <div style="padding:24px 30px;border-bottom:1px solid #f0e8db">
      <h3 style="color:#c8952a;font-size:13px;letter-spacing:2px;margin:0 0 16px">DETALLE DEL PEDIDO</h3>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr style="background:#f5efe6">
          <th style="padding:8px 12px;text-align:left;font-size:12px;color:#5c4a3a">PRODUCTO</th>
          <th style="padding:8px 12px;text-align:center;font-size:12px;color:#5c4a3a">CANT.</th>
          <th style="padding:8px 12px;text-align:right;font-size:12px;color:#5c4a3a">SUBTOTAL</th>
        </tr></thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot><tr>
          <td colspan="2" style="padding:12px;font-size:14px;font-weight:bold">Total</td>
          <td style="padding:12px;text-align:right;font-size:14px;font-weight:bold;color:#c8952a">${formatPrice(total)}</td>
        </tr></tfoot>
      </table>
    </div>
    <div style="padding:28px 30px;text-align:center;border-bottom:1px solid #f0e8db">
      <a href="${trackingUrl}" style="display:inline-block;padding:14px 36px;background:#c8952a;color:white;text-decoration:none;font-size:13px;letter-spacing:2px">VER MI PEDIDO</a>
    </div>
    <div style="padding:20px 30px;text-align:center">
      <p style="color:#5c4a3a;font-size:12px;margin:0 0 4px">ventas@nevada.com &nbsp;|&nbsp; +57 300 649 6663</p>
      <p style="color:#5c4a3a;font-size:12px;margin:0 0 14px">Bucaramanga, Colombia</p>
      <p style="color:#c8952a;font-size:13px;margin:0;font-style:italic">✦ Nevada — Chaquetas y Ovejeras ✦</p>
    </div>
  </div>`
}

export async function POST(req: Request) {
  try {
    if (!resend) {
      return NextResponse.json({ ok: false, error: "Email service not configured" }, { status: 503 })
    }

    const body = await req.json()
    const { order, items, event } = body

    if (!order?.customer_email) {
      return NextResponse.json({ ok: false, error: "Falta customer_email" }, { status: 400 })
    }

    const cfg = EVENT_CONFIG[event]
    if (!cfg) return NextResponse.json({ ok: true, skipped: true })

    await resend.emails.send({
      from: FROM_EMAIL,
      to: order.customer_email,
      subject: `Santizzima – Pedido #${order.short_id} · ${cfg.subject}`,
      html: buildEmailHtml({
        customerName: order.customer_name ?? "Cliente",
        shortId: order.short_id ?? "—",
        items: items ?? [],
        total: order.total ?? 0,
        event,
      }),
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("Error enviando email:", error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
