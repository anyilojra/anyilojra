'use server'

import { db } from '@/lib/db'
import { products as productsTable } from '@/lib/db/schema'
import { eq, and, ne } from 'drizzle-orm'
import { products as staticProducts } from '@/lib/products'

export async function getProductFromDB(productId: string) {
  try {
    const product = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, productId))
      .limit(1)

    return product[0] || null
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export async function getRelatedProductsFromDB(category: string, excludeId: string) {
  try {
    const related = await db
      .select()
      .from(productsTable)
      .where(
        and(
          eq(productsTable.category, category),
          ne(productsTable.id, excludeId)
        )
      )
      .limit(4)

    return related
  } catch (error) {
    console.error('Error fetching related products:', error)
    return []
  }
}

export async function seedProducts() {
  try {
    // Check if products already exist
    const existingProducts = await db.select().from(productsTable).limit(1)
    
    if (existingProducts.length > 0) {
      return { success: true, message: 'Products already seeded' }
    }

    // Insert all static products
    for (const product of staticProducts) {
      await db.insert(productsTable).values({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        image: product.image,
        description: product.description,
        sizes: product.sizes,
        colors: product.colors,
        stock: 10, // Default stock
      })
    }

    return { success: true, message: 'Products seeded successfully' }
  } catch (error) {
    console.error('Error seeding products:', error)
    return { success: false, message: 'Error seeding products' }
  }
}
