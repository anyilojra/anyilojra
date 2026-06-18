import { createClient } from "@/utils/supabase/client"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ReturnReason =
  | "defecto_fabrica"
  | "talla_incorrecta"
  | "color_incorrecto"
  | "producto_incorrecto"
  | "no_cumple_expectativas"
  | "otro"

export type ReturnResolution =
  | "reembolso_bancario"
  | "nota_credito"
  | "cambio_producto"

export type ReturnStatus =
  | "solicitada"       // Cliente inició la solicitud
  | "aprobada"         // Admin aprobó; esperando recepción física
  | "recibida"         // Mercancía llegó al almacén
  | "returned"         // Completada: stock revertido + nota crédito/reembolso emitido
  | "rechazada"        // No cumple condiciones

export interface ReturnItem {
  id?: string
  return_id?: string
  order_item_id?: string
  product_id: string
  product_name: string
  quantity: number
  size: string
  color: string
  price: number           // Precio unitario al momento de la venta
  subtotal: number        // quantity * price
}

export interface Return {
  id?: string
  short_id?: string        // Ej: DEV-1234
  order_id: string
  order_short_id: string
  customer_name: string
  customer_email: string
  reason: ReturnReason
  reason_detail?: string
  resolution: ReturnResolution
  status: ReturnStatus
  total_amount: number     // Monto total a revertir
  credit_note_number?: string  // Correlativo de nota crédito, si aplica
  admin_notes?: string
  created_at?: string
  approved_at?: string
  received_at?: string
  completed_at?: string
  items?: ReturnItem[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function generateReturnShortId(): string {
  const numbers = Math.floor(1000 + Math.random() * 9000)
  return `DEV-${numbers}`
}

export function generateCreditNoteNumber(): string {
  const year = new Date().getFullYear()
  const seq = Math.floor(1000 + Math.random() * 9000)
  return `NC-${year}-${seq}`
}

export const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
  defecto_fabrica: "Defecto de fábrica",
  talla_incorrecta: "Talla incorrecta",
  color_incorrecto: "Color incorrecto",
  producto_incorrecto: "Producto incorrecto",
  no_cumple_expectativas: "No cumple expectativas",
  otro: "Otro motivo",
}

export const RETURN_RESOLUTION_LABELS: Record<ReturnResolution, string> = {
  reembolso_bancario: "Reembolso bancario",
  nota_credito: "Nota de crédito",
  cambio_producto: "Cambio de producto",
}

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  solicitada: "Solicitada",
  aprobada: "Aprobada",
  recibida: "Recibida",
  returned: "Completada",
  rechazada: "Rechazada",
}

// ─────────────────────────────────────────────────────────────────────────────
// Create return request
// ─────────────────────────────────────────────────────────────────────────────

export async function createReturn(
  returnData: Omit<Return, "id" | "short_id" | "status" | "created_at" | "credit_note_number">,
  items: Omit<ReturnItem, "id" | "return_id">[]
): Promise<{ data: Return | null; error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { data: null, error: "Database connection not available" }

  const short_id = generateReturnShortId()

  const { data: returnRecord, error: returnError } = await supabase
    .from("returns")
    .insert([
      {
        short_id,
        order_id: returnData.order_id,
        order_short_id: returnData.order_short_id,
        customer_name: returnData.customer_name,
        customer_email: returnData.customer_email,
        reason: returnData.reason,
        reason_detail: returnData.reason_detail ?? null,
        resolution: returnData.resolution,
        status: "solicitada",
        total_amount: returnData.total_amount,
        admin_notes: null,
      },
    ])
    .select()
    .single()

  if (returnError) {
    console.error("Error creating return:", returnError)
    return { data: null, error: returnError.message }
  }

  const returnItems = items.map((item) => ({
    return_id: returnRecord.id,
    product_id: item.product_id,
    product_name: item.product_name,
    quantity: item.quantity,
    size: item.size,
    color: item.color,
    price: item.price,
    subtotal: item.subtotal,
  }))

  const { error: itemsError } = await supabase.from("return_items").insert(returnItems)

  if (itemsError) {
    console.error("Error creating return items:", itemsError)
    return { data: returnRecord, error: itemsError.message }
  }

  return { data: returnRecord, error: null }
}

// ─────────────────────────────────────────────────────────────────────────────
// Approve return
// ─────────────────────────────────────────────────────────────────────────────

export async function approveReturn(
  returnId: string,
  adminNotes?: string
): Promise<{ data: Return | null; error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { data: null, error: "Database connection not available" }

  const { data, error } = await supabase
    .from("returns")
    .update({
      status: "aprobada",
      approved_at: new Date().toISOString(),
      admin_notes: adminNotes ?? null,
    })
    .eq("id", returnId)
    .select()
    .single()

  if (error) {
    console.error("Error approving return:", error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

// ─────────────────────────────────────────────────────────────────────────────
// Mark merchandise as received
// ─────────────────────────────────────────────────────────────────────────────

export async function markReturnReceived(
  returnId: string
): Promise<{ data: Return | null; error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { data: null, error: "Database connection not available" }

  const { data, error } = await supabase
    .from("returns")
    .update({
      status: "recibida",
      received_at: new Date().toISOString(),
    })
    .eq("id", returnId)
    .select()
    .single()

  if (error) {
    console.error("Error marking return received:", error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

// ─────────────────────────────────────────────────────────────────────────────
// Complete return:
//  1. Reverts stock for each returned item
//  2. Generates credit note number (if resolution = nota_credito)
//  3. Marks order item as returned (optional, soft flag)
//  4. Sets return status = "returned"
// ─────────────────────────────────────────────────────────────────────────────

export async function completeReturn(
  returnId: string
): Promise<{ data: Return | null; error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { data: null, error: "Database connection not available" }

  // 1. Fetch full return with items
  const { data: returnRecord, error: fetchError } = await supabase
    .from("returns")
    .select("*, items:return_items(*)")
    .eq("id", returnId)
    .single()

  if (fetchError || !returnRecord) {
    return { data: null, error: fetchError?.message ?? "Return not found" }
  }

  if (returnRecord.status !== "recibida") {
    return { data: null, error: "La devolución debe estar en estado 'recibida' antes de completarla." }
  }

  const items: ReturnItem[] = returnRecord.items ?? []

  // 2. Revert stock for each item
  for (const item of items) {
    // Fetch current stock
    const { data: product, error: fetchProductError } = await supabase
      .from("products")
      .select("stock")
      .eq("id", item.product_id)
      .single()

    if (fetchProductError || !product) {
      console.error(`Could not fetch stock for product ${item.product_id}`)
      continue // Non-blocking: log and continue
    }

    const newStock = (product.stock ?? 0) + item.quantity

    const { error: stockError } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", item.product_id)

    if (stockError) {
      console.error(`Error reverting stock for product ${item.product_id}:`, stockError)
    }
  }

  // 3. Generate credit note number if applicable
  const creditNoteNumber =
    returnRecord.resolution === "nota_credito" ? generateCreditNoteNumber() : null

  // 4. Mark the order as having a return (soft flag on the order)
  await supabase
    .from("orders")
    .update({ has_return: true })
    .eq("id", returnRecord.order_id)

  // 5. Update return status to "returned"
  const { data: completed, error: updateError } = await supabase
    .from("returns")
    .update({
      status: "returned",
      completed_at: new Date().toISOString(),
      credit_note_number: creditNoteNumber,
    })
    .eq("id", returnId)
    .select()
    .single()

  if (updateError) {
    console.error("Error completing return:", updateError)
    return { data: null, error: updateError.message }
  }

  return { data: completed, error: null }
}

// ─────────────────────────────────────────────────────────────────────────────
// Reject return
// ─────────────────────────────────────────────────────────────────────────────

export async function rejectReturn(
  returnId: string,
  adminNotes: string
): Promise<{ data: Return | null; error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { data: null, error: "Database connection not available" }

  const { data, error } = await supabase
    .from("returns")
    .update({
      status: "rechazada",
      admin_notes: adminNotes,
    })
    .eq("id", returnId)
    .select()
    .single()

  if (error) {
    console.error("Error rejecting return:", error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch all returns
// ─────────────────────────────────────────────────────────────────────────────

export async function getReturns(): Promise<Return[]> {
  const supabase = createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from("returns")
    .select("*, items:return_items(*)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching returns:", error)
    return []
  }

  return (data ?? []) as Return[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch single return by short ID
// ─────────────────────────────────────────────────────────────────────────────

export async function getReturnByShortId(shortId: string): Promise<Return | null> {
  const supabase = createClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from("returns")
    .select("*, items:return_items(*)")
    .eq("short_id", shortId.toUpperCase())
    .single()

  if (error) {
    console.error("Error fetching return:", error)
    return null
  }

  return data as Return
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch returns by order ID
// ─────────────────────────────────────────────────────────────────────────────

export async function getReturnsByOrderId(orderId: string): Promise<Return[]> {
  const supabase = createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from("returns")
    .select("*, items:return_items(*)")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching returns for order:", error)
    return []
  }

  return (data ?? []) as Return[]
}
