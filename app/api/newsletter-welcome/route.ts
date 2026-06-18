import { Resend } from "resend"
import { NextResponse } from "next/server"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nevada.com"
const FROM_EMAIL = "Nevada <ventas@nevada.com>"

export async function POST(req: Request) {
  try {
    if (!resend) {
      return NextResponse.json({ ok: false, error: "Email service not configured" }, { status: 503 })
    }

    const { email, first_name, gender, code } = await req.json()

    if (!email || !first_name || !code) {
      return NextResponse.json({ ok: false, error: "Faltan datos" }, { status: 400 })
    }

    const isHombre = gender === "masculino"
    const shopUrl = isHombre ? `${SITE_URL}/hombre` : `${SITE_URL}/mujer`
    const greeting = isHombre ? "Hola" : "Hola"

    // Productos sugeridos según género
    const products = isHombre
      ? [
          { name: "Chaqueta Premium", img: `${SITE_URL}/productos/hombre1.jpg`, url: `${SITE_URL}/hombre` },
          { name: "Ovejera Clásica", img: `${SITE_URL}/productos/hombre2.jpg`, url: `${SITE_URL}/hombre` },
          { name: "Chaqueta Denim", img: `${SITE_URL}/productos/hombre3.jpg`, url: `${SITE_URL}/hombre` },
        ]
      : [
          { name: "Chaqueta Mujer", img: `${SITE_URL}/productos/mujer1.jpg`, url: `${SITE_URL}/mujer` },
          { name: "Ovejera Elegance", img: `${SITE_URL}/productos/mujer2.jpg`, url: `${SITE_URL}/mujer` },
          { name: "Chaqueta Moderna", img: `${SITE_URL}/productos/mujer3.jpg`, url: `${SITE_URL}/mujer` },
        ]

    const productsHtml = products
      .map(
        (p) => `
      <td style="width:33%;padding:8px;text-align:center;vertical-align:top">
        <a href="${p.url}" style="text-decoration:none">
          <img src="${p.img}" alt="${p.name}"
            style="width:100%;max-width:150px;height:180px;object-fit:cover;border-radius:6px;display:block;margin:0 auto"/>
          <p style="color:#1a0a00;font-size:12px;margin:8px 0 0;font-family:Georgia,serif">${p.name}</p>
        </a>
      </td>`
      )
      .join("")

    const html = `
<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a0a00;background:#fff">

  <!-- Header -->
  <div style="background:#c8952a;padding:28px 30px;text-align:center">
    <img src="${SITE_URL}/logo.svg" alt="Nevada" width="70" height="70"
      style="display:block;margin:0 auto 12px;border-radius:50%;background:white;padding:4px"/>
    <h1 style="color:white;margin:0;font-size:24px;letter-spacing:3px">NEVADA</h1>
    <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-style:italic;font-size:13px">Chaquetas y Ovejeras</p>
  </div>

  <!-- Bienvenida -->
  <div style="background:#f5efe6;padding:28px 30px;text-align:center;border-bottom:2px solid #c8952a">
    <p style="font-size:36px;margin:0">🎁</p>
    <h2 style="color:#1a0a00;margin:12px 0 6px;font-size:22px">${greeting} ${first_name}, ¡bienvenid${isHombre ? "o" : "a"}!</h2>
    <p style="color:#5c4a3a;font-size:14px;margin:0;line-height:1.7">
      Ya eres parte de nuestra comunidad. Como regalo de bienvenida,<br/>
      aquí tienes tu código de descuento exclusivo:
    </p>
  </div>

  <!-- Código -->
  <div style="padding:30px;text-align:center;border-bottom:1px solid #f0e8db">
    <p style="color:#5c4a3a;font-size:13px;margin:0 0 12px">Usa este código en tu carrito de compras:</p>
    <div style="display:inline-block;background:#1a0a00;color:white;padding:14px 40px;font-size:22px;letter-spacing:5px;font-weight:bold;border-radius:4px">
      ${code}
    </div>
    <p style="color:#5c4a3a;font-size:12px;margin:14px 0 0">Válido para tu primera compra · 15% de descuento</p>
    <a href="${shopUrl}"
      style="display:inline-block;margin-top:20px;padding:13px 36px;background:#c8952a;color:white;text-decoration:none;font-size:13px;letter-spacing:2px">
      COMPRAR AHORA
    </a>
  </div>

  <!-- Productos sugeridos -->
  <div style="padding:28px 30px;border-bottom:1px solid #f0e8db">
    <h3 style="color:#c8952a;font-size:13px;letter-spacing:2px;margin:0 0 20px;text-align:center">
      SELECCIÓN PARA TI
    </h3>
    <table style="width:100%;border-collapse:collapse">
      <tr>${productsHtml}</tr>
    </table>
  </div>

  <!-- Footer -->
  <div style="padding:20px 30px;text-align:center">
    <p style="color:#5c4a3a;font-size:12px;margin:0 0 4px">ventas@nevada.com &nbsp;|&nbsp; +57 300 649 6663</p>
    <p style="color:#5c4a3a;font-size:12px;margin:0 0 14px">Bucaramanga, Colombia</p>
    <p style="color:#c8952a;font-size:13px;margin:0;font-style:italic">✦ Nevada — Chaquetas y Ovejeras ✦</p>
  </div>

</div>`

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "🎁 Tu código de descuento exclusivo – Santizzima",
      html,
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("Error enviando email de bienvenida:", error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
