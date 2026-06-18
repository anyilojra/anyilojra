import { db } from './client'
import { returns } from './schema'
import { eq, desc } from 'drizzle-orm'

export async function createReturn(returnData: {
  order_id: string
  reason: string
  notes?: string
}) {
  try {
    const returnId = `return_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const created = await db.insert(returns).values({
      id: returnId,
      ...returnData,
      status: 'pending',
    }).returning()

    return { return: created[0], error: null }
  } catch (error) {
    console.error('[v0] Error creating return:', error)
    return { return: null, error: String(error) }
  }
}

export async function getReturns(limit = 50, offset = 0) {
  try {
    const allReturns = await db
      .select()
      .from(returns)
      .orderBy(desc(returns.createdAt))
      .limit(limit)
      .offset(offset)

    return { returns: allReturns, error: null }
  } catch (error) {
    console.error('[v0] Error fetching returns:', error)
    return { returns: [], error: String(error) }
  }
}

export async function updateReturnStatus(returnId: string, status: string, refund_amount?: number) {
  try {
    const updated = await db
      .update(returns)
      .set({ 
        status, 
        refund_amount,
        updatedAt: new Date() 
      })
      .where(eq(returns.id, returnId))
      .returning()

    return { return: updated[0], error: null }
  } catch (error) {
    console.error('[v0] Error updating return status:', error)
    return { return: null, error: String(error) }
  }
}

export async function getReturnsByOrderId(orderId: string) {
  try {
    const orderReturns = await db
      .select()
      .from(returns)
      .where(eq(returns.order_id, orderId))

    return { returns: orderReturns, error: null }
  } catch (error) {
    console.error('[v0] Error fetching returns by order:', error)
    return { returns: [], error: String(error) }
  }
}
