import { db } from './client'
import { products } from './schema'
import { eq } from 'drizzle-orm'

export async function getProducts(limit = 50, offset = 0) {
  try {
    const allProducts = await db
      .select()
      .from(products)
      .limit(limit)
      .offset(offset)

    return { products: allProducts, error: null }
  } catch (error) {
    console.error('[v0] Error fetching products:', error)
    return { products: [], error: String(error) }
  }
}

export async function getProductById(productId: string) {
  try {
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))

    return { product: product[0], error: null }
  } catch (error) {
    console.error('[v0] Error fetching product:', error)
    return { product: null, error: String(error) }
  }
}

export async function getProductsByCategory(category: string, limit = 50, offset = 0) {
  try {
    const categoryProducts = await db
      .select()
      .from(products)
      .where(eq(products.category, category))
      .limit(limit)
      .offset(offset)

    return { products: categoryProducts, error: null }
  } catch (error) {
    console.error('[v0] Error fetching products by category:', error)
    return { products: [], error: String(error) }
  }
}

export async function createProduct(productData: {
  name: string
  price: number
  category: string
  image: string
  description: string
  sizes?: string[]
  colors?: string[]
  stock?: number
}) {
  try {
    const id = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const created = await db
      .insert(products)
      .values({
        id,
        ...productData,
        stock: productData.stock || 0,
      })
      .returning()

    return { product: created[0], error: null }
  } catch (error) {
    console.error('[v0] Error creating product:', error)
    return { product: null, error: String(error) }
  }
}

export async function updateProduct(productId: string, updates: any) {
  try {
    const updated = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, productId))
      .returning()

    return { product: updated[0], error: null }
  } catch (error) {
    console.error('[v0] Error updating product:', error)
    return { product: null, error: String(error) }
  }
}

export async function decreaseProductStock(productId: string, quantity: number) {
  try {
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))

    if (!product[0]) {
      return { error: 'Product not found' }
    }

    const newStock = Math.max(0, product[0].stock - quantity)
    
    await db
      .update(products)
      .set({ stock: newStock })
      .where(eq(products.id, productId))

    return { error: null }
  } catch (error) {
    console.error('[v0] Error decreasing stock:', error)
    return { error: String(error) }
  }
}

export async function increaseProductStock(productId: string, quantity: number) {
  try {
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))

    if (!product[0]) {
      return { error: 'Product not found' }
    }

    const newStock = product[0].stock + quantity
    
    await db
      .update(products)
      .set({ stock: newStock })
      .where(eq(products.id, productId))

    return { error: null }
  } catch (error) {
    console.error('[v0] Error increasing stock:', error)
    return { error: String(error) }
  }
}

export async function deleteProduct(productId: string) {
  try {
    await db.delete(products).where(eq(products.id, productId))
    return { error: null }
  } catch (error) {
    console.error('[v0] Error deleting product:', error)
    return { error: String(error) }
  }
}

export type Product = typeof products.$inferSelect
