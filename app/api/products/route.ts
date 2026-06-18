'use server'

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const allProducts = await db.select().from(products)
    return NextResponse.json({ products: allProducts })
  } catch (error) {
    console.error('[v0] Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const newProduct = {
      id: `prod_${Date.now()}`,
      name: data.name,
      price: data.price,
      stock: data.stock,
      category: data.category,
      image: data.image,
      description: data.description || '',
      sizes: data.sizes || [],
      colors: data.colors || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    const result = await db.insert(products).values(newProduct).returning()
    return NextResponse.json({ product: result[0] })
  } catch (error) {
    console.error('[v0] Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
