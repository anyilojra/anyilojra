import { db } from './client'
import { discount_codes } from './schema'
import { eq } from 'drizzle-orm'

export async function validateDiscountCode(code: string) {
  try {
    const discount = await db
      .select()
      .from(discount_codes)
      .where(eq(discount_codes.code, code))

    if (!discount[0]) {
      return { discount: null, error: 'Código no encontrado' }
    }

    const discountCode = discount[0]

    // Check if active
    if (!discountCode.active) {
      return { discount: null, error: 'Este código no está activo' }
    }

    // Check if expired
    if (discountCode.expires_at && new Date(discountCode.expires_at) < new Date()) {
      return { discount: null, error: 'Este código ha expirado' }
    }

    // Check max uses
    if (discountCode.max_uses && discountCode.current_uses >= discountCode.max_uses) {
      return { discount: null, error: 'Este código ha alcanzado el máximo de usos' }
    }

    return { discount: discountCode, error: null }
  } catch (error) {
    console.error('[v0] Error validating discount code:', error)
    return { discount: null, error: String(error) }
  }
}

export async function incrementDiscountUsage(discountId: string) {
  try {
    const discount = await db
      .select()
      .from(discount_codes)
      .where(eq(discount_codes.id, discountId))

    if (!discount[0]) {
      return { error: 'Discount not found' }
    }

    await db
      .update(discount_codes)
      .set({ current_uses: discount[0].current_uses + 1 })
      .where(eq(discount_codes.id, discountId))

    return { error: null }
  } catch (error) {
    console.error('[v0] Error incrementing discount usage:', error)
    return { error: String(error) }
  }
}

export async function getDiscountCodes(limit = 50, offset = 0) {
  try {
    const codes = await db
      .select()
      .from(discount_codes)
      .limit(limit)
      .offset(offset)

    return { codes, error: null }
  } catch (error) {
    console.error('[v0] Error fetching discount codes:', error)
    return { codes: [], error: String(error) }
  }
}

export async function createDiscountCode(codeData: {
  code: string
  type: string
  value: number
  max_uses?: number
  expires_at?: Date
}) {
  try {
    const id = `discount_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const created = await db
      .insert(discount_codes)
      .values({
        id,
        ...codeData,
        active: true,
      })
      .returning()

    return { discount: created[0], error: null }
  } catch (error) {
    console.error('[v0] Error creating discount code:', error)
    return { discount: null, error: String(error) }
  }
}

export async function updateDiscountCode(discountId: string, updates: any) {
  try {
    const updated = await db
      .update(discount_codes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(discount_codes.id, discountId))
      .returning()

    return { discount: updated[0], error: null }
  } catch (error) {
    console.error('[v0] Error updating discount code:', error)
    return { discount: null, error: String(error) }
  }
}

export async function isFirstPurchase(email: string) {
  try {
    const { getOrders } = await import('./orders')
    const { orders } = await getOrders()
    
    const hasPurchased = orders.some(order => order.customer_email === email)
    return !hasPurchased
  } catch (error) {
    console.error('[v0] Error checking first purchase:', error)
    return false
  }
}

export type DiscountCode = typeof discount_codes.$inferSelect
