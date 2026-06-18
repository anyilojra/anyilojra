import { db } from './client'
import { orders, order_items, order_payments } from './schema'
import { eq, desc, and, ne } from 'drizzle-orm'

export async function createOrder(orderData: {
  short_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  shipping_city: string
  shipping_department: string
  payment_method: string
  payment_phone?: string
  total: number
  userId?: string
}, items: {
  product_id: string
  product_name: string
  quantity: number
  size?: string
  color?: string
  price: number
  product_image?: string
}[]) {
  try {
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Create the order
    const createdOrder = await db.insert(orders).values({
      id: orderId,
      ...orderData,
      status: 'pending',
    }).returning()

    // Create order items
    for (const item of items) {
      await db.insert(order_items).values({
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        order_id: orderId,
        ...item,
      })
    }

    return { order: createdOrder[0], error: null }
  } catch (error) {
    console.error('[v0] Error creating order:', error)
    return { order: null, error: String(error) }
  }
}

export async function getOrders(limit = 50, offset = 0) {
  try {
    const allOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset)

    const items = await db.select().from(order_items)

    const ordersWithItems = allOrders.map(order => ({
      ...order,
      items: items.filter(item => item.order_id === order.id),
    }))

    return { orders: ordersWithItems, error: null }
  } catch (error) {
    console.error('[v0] Error fetching orders:', error)
    return { orders: [], error: String(error) }
  }
}

export async function getOrderById(orderId: string) {
  try {
    const order = await db.select().from(orders).where(eq(orders.id, orderId))
    const items = await db.select().from(order_items).where(eq(order_items.order_id, orderId))

    return { 
      order: order[0] ? { ...order[0], items } : null, 
      error: null 
    }
  } catch (error) {
    console.error('[v0] Error fetching order:', error)
    return { order: null, error: String(error) }
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const updated = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning()

    return { order: updated[0], error: null }
  } catch (error) {
    console.error('[v0] Error updating order status:', error)
    return { order: null, error: String(error) }
  }
}

export async function getOrderByShortId(shortId: string) {
  try {
    const order = await db.select().from(orders).where(eq(orders.short_id, shortId))
    const items = order[0] ? await db.select().from(order_items).where(eq(order_items.order_id, order[0].id)) : []

    return {
      order: order[0] ? { ...order[0], items } : null,
      error: null
    }
  } catch (error) {
    console.error('[v0] Error fetching order by short_id:', error)
    return { order: null, error: String(error) }
  }
}

export async function getPendingOrders() {
  try {
    const pendingOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          ne(orders.status, 'delivered'),
          ne(orders.status, 'cancelled')
        )
      )
      .orderBy(desc(orders.createdAt))

    const items = await db.select().from(order_items)

    const ordersWithItems = pendingOrders.map(order => ({
      ...order,
      items: items.filter(item => item.order_id === order.id),
    }))

    return { orders: ordersWithItems, error: null }
  } catch (error) {
    console.error('[v0] Error fetching pending orders:', error)
    return { orders: [], error: String(error) }
  }
}
