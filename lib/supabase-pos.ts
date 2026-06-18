import { createClient } from "@/utils/supabase/client"
import { type Product } from "@/lib/supabase-products"

export interface PosCartItem {
  product: Product
  quantity: number
  size: string
  color: string
}

export interface PosSale {
  id?: string
  short_id?: string
  items: PosCartItem[]
  total: number
  payment_method: "efectivo" | "transferencia" | "tarjeta"
  cashier_note?: string
  created_at?: string
}

/**
 * Genera un ID corto para venta en tienda: POS-XXXX
 */
export function generatePosId(): string {
  const numbers = Math.floor(1000 + Math.random() * 9000)
  return `POS-${numbers}`
}

/**
 * Busca un producto por código de barras (campo barcode) o por ID parcial.
 * Si Supabase no está disponible, retorna null.
 */
export async function searchProductByBarcode(
  code: string
): Promise<Product | null> {
  const supabase = createClient()
  if (!supabase) return null

  // Intentar por campo barcode primero
  const { data: byBarcode } = await supabase
    .from("products")
    .select("*")
    .eq("barcode", code)
    .maybeSingle()

  if (byBarcode) return byBarcode

  // Luego por id exacto
  const { data: byId } = await supabase
    .from("products")
    .select("*")
    .eq("id", code)
    .maybeSingle()

  if (byId) return byId

  // Por último búsqueda de texto en nombre
  const { data: byName } = await supabase
    .from("products")
    .select("*")
    .ilike("name", `%${code}%`)
    .limit(1)
    .maybeSingle()

  return byName || null
}

/**
 * Registra la venta en tienda en Supabase y descuenta el stock de cada producto.
 */
export async function registerPosSale(sale: PosSale): Promise<{
  success: boolean
  short_id?: string
  error?: string
}> {
  const supabase = createClient()
  if (!supabase) {
    return { success: false, error: "Conexión a base de datos no disponible" }
  }

  const short_id = generatePosId()

  // Insertar la venta
  const { data: saleData, error: saleError } = await supabase
    .from("pos_sales")
    .insert([
      {
        short_id,
        total: sale.total,
        payment_method: sale.payment_method,
        cashier_note: sale.cashier_note || "",
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (saleError || !saleData) {
    console.error("Error creating POS sale:", saleError?.message)
    return { success: false, error: saleError?.message || "Error al registrar venta" }
  }

  // Insertar los items de la venta
  const itemsPayload = sale.items.map((item) => ({
    sale_id: saleData.id,
    product_id: item.product.id,
    product_name: item.product.name,
    quantity: item.quantity,
    size: item.size,
    color: item.color,
    price: item.product.price,
  }))

  const { error: itemsError } = await supabase
    .from("pos_sale_items")
    .insert(itemsPayload)

  if (itemsError) {
    console.error("Error inserting POS items:", itemsError.message)
    return { success: false, error: itemsError.message }
  }

  // Descontar stock de cada producto
  for (const item of sale.items) {
    const { data: prod } = await supabase
      .from("products")
      .select("stock")
      .eq("id", item.product.id)
      .single()

    if (prod) {
      const newStock = Math.max(0, prod.stock - item.quantity)
      await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", item.product.id)
    }
  }

  return { success: true, short_id }
}

/**
 * Obtiene todas las ventas POS (para reportes futuros).
 */
export async function getPosSales(): Promise<PosSale[]> {
  const supabase = createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from("pos_sales")
    .select("*, pos_sale_items(*)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching POS sales:", error.message)
    return []
  }

  return data || []
}
