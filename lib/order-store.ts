// Local order storage (simulates database without Supabase)
// In production, replace with actual database integration

export interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  size: string
  color: string
  price: number
  image: string
}

export interface Order {
  id: string
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
  items: OrderItem[]
  created_at: string
  payment_confirmed_at?: string
  shipped_at?: string
  notes?: string
}

const ORDERS_KEY = "santizzima_orders"

function generateOrderId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `ORD-${timestamp}-${random}`.toUpperCase()
}

export function getOrders(): Order[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(ORDERS_KEY)
  return data ? JSON.parse(data) : []
}

export function getOrderById(id: string): Order | null {
  const orders = getOrders()
  return orders.find(order => order.id === id) || null
}

export function createOrder(orderData: Omit<Order, "id" | "created_at" | "status">): Order {
  const orders = getOrders()
  
  const newOrder: Order = {
    ...orderData,
    id: generateOrderId(),
    status: "pending",
    created_at: new Date().toISOString()
  }
  
  orders.unshift(newOrder)
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
  
  return newOrder
}

export function updateOrderStatus(
  id: string, 
  status: Order["status"],
  additionalData?: Partial<Order>
): Order | null {
  const orders = getOrders()
  const index = orders.findIndex(order => order.id === id)
  
  if (index === -1) return null
  
  orders[index] = {
    ...orders[index],
    ...additionalData,
    status
  }
  
  // Add timestamps based on status
  if (status === "payment_confirmed") {
    orders[index].payment_confirmed_at = new Date().toISOString()
  } else if (status === "shipped") {
    orders[index].shipped_at = new Date().toISOString()
  }
  
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
  
  return orders[index]
}

export function deleteOrder(id: string): boolean {
  const orders = getOrders()
  const filtered = orders.filter(order => order.id !== id)
  
  if (filtered.length === orders.length) return false
  
  localStorage.setItem(ORDERS_KEY, JSON.stringify(filtered))
  return true
}

export function getOrdersByStatus(status: Order["status"]): Order[] {
  const orders = getOrders()
  return orders.filter(order => order.status === status)
}

export function getPendingPaymentsCount(): number {
  const orders = getOrders()
  return orders.filter(order => order.status === "pending").length
}

// Simulate SMS notification (in production, use Twilio or similar)
export function sendSMSNotification(phone: string, message: string): Promise<boolean> {
  console.log(`[SMS SIMULATION] To: ${phone}`)
  console.log(`[SMS SIMULATION] Message: ${message}`)
  
  // Store notification in localStorage for demo purposes
  const notifications = JSON.parse(localStorage.getItem("santizzima_sms_log") || "[]")
  notifications.push({
    phone,
    message,
    sent_at: new Date().toISOString()
  })
  localStorage.setItem("santizzima_sms_log", JSON.stringify(notifications))
  
  return Promise.resolve(true)
}

export function getSMSLog(): Array<{ phone: string; message: string; sent_at: string }> {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem("santizzima_sms_log") || "[]")
}
