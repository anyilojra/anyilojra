'use server'

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, order_items, order_payments } from '@/lib/db/schema'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { items, total, payment_method, cashier_note } = data

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'No items in cart' }, { status: 400 })
    }

    const short_id = Math.random().toString(36).substring(2, 8).toUpperCase()
    const order_id = `order_${Date.now()}`

    // Create order
    const orderResult = await db.insert(orders).values({
      id: order_id,
      short_id,
      customer_name: 'Venta Tienda',
      customer_email: 'pos@nevada.local',
      customer_phone: '',
      shipping_address: 'Punto de venta',
      shipping_city: 'Bucaramanga',
      shipping_department: 'Santander',
      payment_method: payment_method || 'efectivo',
      total,
      status: 'confirmed',
      notes: cashier_note || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()

    // Create order items
    for (const item of items) {
      await db.insert(order_items).values({
        id: nanoid(),
        order_id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.product.price,
        product_image: item.product.image,
        createdAt: new Date(),
      })
    }

    // Create payment record
    await db.insert(order_payments).values({
      id: nanoid(),
      order_id,
      amount: total,
      payment_method: payment_method || 'efectivo',
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      short_id,
      order_id,
    })
  } catch (error) {
    console.error('[v0] Error registering POS sale:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to register sale' },
      { status: 500 }
    )
  }
}
