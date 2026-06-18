import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // ✅ Crear el cliente aquí adentro, no afuera
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: stalePending, error } = await supabase
    .from("orders")
    .select("id, short_id, customer_email, created_at")
    .eq("status", "pending")
    .lt("created_at", sevenDaysAgo.toISOString())

  if (error) {
    console.error("Cron error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log(`Cron: ${stalePending?.length} órdenes pendientes antiguas`)

  return NextResponse.json({
    ok: true,
    checked_at: new Date().toISOString(),
    stale_orders: stalePending?.length ?? 0,
  })
}