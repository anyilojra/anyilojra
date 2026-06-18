import { createClient } from "@/utils/supabase/client"

export interface DiscountCode {
  id?: string
  code: string
  type: "percentage" | "fixed" | "first_purchase"
  value: number
  max_uses: number | null
  used_count?: number
  active?: boolean
  created_at?: string
}

export async function validateDiscountCode(
  code: string
): Promise<{ discount: DiscountCode | null; error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("discount_codes")
    .select("*")
    .eq("code", code.toUpperCase().trim())
    .eq("active", true)
    .single()

  if (error || !data) return { discount: null, error: "Código no válido o expirado" }
  if (data.max_uses !== null && data.used_count >= data.max_uses)
    return { discount: null, error: "Este código ya alcanzó su límite de usos" }

  return { discount: data, error: null }
}

export async function incrementDiscountUsage(id: string) {
  const supabase = createClient()
  await supabase.rpc("increment_discount_usage", { discount_id: id })
}

export async function getDiscountCodes(): Promise<DiscountCode[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from("discount_codes")
    .select("*")
    .order("created_at", { ascending: false })
  return data || []
}

export async function createDiscountCode(
  discount: Omit<DiscountCode, "id" | "used_count" | "created_at">
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase.from("discount_codes").insert([{
    ...discount,
    code: discount.code.toUpperCase().trim(),
    used_count: 0,
    active: true,
  }])
  return { error: error?.message || null }
}

export async function toggleDiscountCode(id: string, active: boolean) {
  const supabase = createClient()
  await supabase.from("discount_codes").update({ active }).eq("id", id)
}
export async function isFirstPurchase(email: string): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase
    .from("orders")
    .select("id")
    .eq("customer_email", email.toLowerCase().trim())
    .limit(1)
  return !data || data.length === 0
}