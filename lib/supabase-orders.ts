import { createClient } from "@/utils/supabase/client"

export interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  size: string
  color: string
  price: number
  product_image?: string
}

export interface Order {
  id?: string
  short_id?: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  shipping_city: string
  shipping_department: string
  payment_method: string
  payment_phone: string
  total: number
  status: "pending" | "payment_confirmed" | "shipped" | "delivered" | "cancelled"
  created_at: string
  delivered_at?: string | null
  has_return?: boolean
  items?: OrderItem[]
}

/**
 * Genera un ID corto legible: 3 letras + guion + 4 dígitos. Ej: NVD-4821
 */
export function generateShortId(): string {
  const numbers = Math.floor(1000 + Math.random() * 9000)
  return `NVD-${numbers}`
}

export async function createOrder(
  order: Omit<Order, "status" | "created_at">,
  items: OrderItem[]
): Promise<{ order: Order | null; error: string | null }> {
  const supabase = createClient()

  if (!supabase) {
    console.error("Supabase client not initialized - missing env vars")
    return { order: null, error: "Database connection not available" }
  }

  const short_id = generateShortId()

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert([
      {
        short_id,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
        shipping_address: order.shipping_address,
        shipping_city: order.shipping_city,
        shipping_department: order.shipping_department,
        payment_method: order.payment_method,
        payment_phone: order.payment_phone,
        total: order.total,
        status: "pending",
      },
    ])
    .select()
    .single()

  if (orderError) {
    console.error("Error creating order:", orderError)
    return { order: null, error: orderError.message }
  }

  const orderItems = items.map((item) => ({
    order_id: orderData.id,
    product_id: item.product_id,
    product_name: item.product_name,
    quantity: item.quantity,
    size: item.size,
    color: item.color,
    price: item.price,
    product_image: item.product_image ?? null,
  }))

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

  if (itemsError) {
    console.error("Error creating order items:", itemsError)
    return { order: orderData, error: itemsError.message }
  }

  return { order: orderData, error: null }
}

export async function getOrders(): Promise<Order[]> {
  const supabase = createClient()

  if (!supabase) {
    console.error("Supabase client not initialized - missing env vars")
    return []
  }

  const { data, error } = await supabase
    .from("orders")
    .select(`*, items:order_items(*)`)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching orders:", error)
    return []
  }

  return (data || []) as Order[]
}

export async function getOrderByShortId(shortId: string): Promise<Order | null> {
  const supabase = createClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from("orders")
    .select(`*, items:order_items(*)`)
    .eq("short_id", shortId.toUpperCase())
    .single()

  if (error) {
    console.error("Error fetching order:", error)
    return null
  }

  return data as Order
}
