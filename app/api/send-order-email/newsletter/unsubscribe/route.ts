import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")

  if (!token) {
    return new Response("<h2>Enlace inválido.</h2>", { headers: { "Content-Type": "text/html" } })
  }

  try {
    const id = Buffer.from(token, "base64url").toString("utf-8")
    const supabase = await createClient()

    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({ subscribed: false })
      .eq("id", id)

    if (error) throw error

    return new Response(
      `<!DOCTYPE html>
      <html lang="es">
      <head><meta charset="UTF-8"><title>Santizzima - Cancelar suscripción</title></head>
      <body style="font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fdf8f0;margin:0">
        <div style="text-align:center;padding:40px;max-width:480px">
          <p style="font-size:40px;margin:0 0 16px">🕊️</p>
          <h1 style="color:#1a0a00;font-size:22px;margin:0 0 12px">Suscripción cancelada</h1>
          <p style="color:#5c4a3a;font-size:14px;line-height:1.7;margin:0 0 24px">
            Tu correo fue eliminado de nuestra lista. No recibirás más newsletters de Santizzima.
          </p>
          <a href="https://www.santizzima.com"
             style="display:inline-block;padding:12px 28px;background:#c8952a;color:white;text-decoration:none;font-size:13px;letter-spacing:1.5px">
            VOLVER A LA TIENDA
          </a>
        </div>
      </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    )
  } catch {
    return new Response(
      "<h2>Ocurrió un error. Intenta de nuevo más tarde.</h2>",
      { headers: { "Content-Type": "text/html" } }
    )
  }
}
