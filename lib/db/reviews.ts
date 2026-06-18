import { db } from './client'
import { reviews } from './schema'
import { eq, desc } from 'drizzle-orm'

export async function createReview(reviewData: {
  product_id: string
  userId?: string
  rating: number
  title: string
  content: string
}) {
  try {
    const reviewId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const created = await db
      .insert(reviews)
      .values({
        id: reviewId,
        ...reviewData,
        approved: false,
      })
      .returning()

    return { review: created[0], error: null }
  } catch (error) {
    console.error('[v0] Error creating review:', error)
    return { review: null, error: String(error) }
  }
}

export async function getProductReviews(productId: string, limit = 10, offset = 0) {
  try {
    const productReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.product_id, productId))
      .orderBy(desc(reviews.createdAt))
      .limit(limit)
      .offset(offset)

    return { reviews: productReviews, error: null }
  } catch (error) {
    console.error('[v0] Error fetching product reviews:', error)
    return { reviews: [], error: String(error) }
  }
}

export async function getApprovedReviews(productId: string, limit = 10) {
  try {
    const approvedReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.product_id, productId))
      .orderBy(desc(reviews.createdAt))
      .limit(limit)

    return { reviews: approvedReviews, error: null }
  } catch (error) {
    console.error('[v0] Error fetching approved reviews:', error)
    return { reviews: [], error: String(error) }
  }
}

export async function approveReview(reviewId: string) {
  try {
    const updated = await db
      .update(reviews)
      .set({ approved: true })
      .where(eq(reviews.id, reviewId))
      .returning()

    return { review: updated[0], error: null }
  } catch (error) {
    console.error('[v0] Error approving review:', error)
    return { review: null, error: String(error) }
  }
}

export async function deleteReview(reviewId: string) {
  try {
    await db.delete(reviews).where(eq(reviews.id, reviewId))
    return { error: null }
  } catch (error) {
    console.error('[v0] Error deleting review:', error)
    return { error: String(error) }
  }
}

export async function getReviewsByUser(userId: string) {
  try {
    const userReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.userId, userId))
      .orderBy(desc(reviews.createdAt))

    return { reviews: userReviews, error: null }
  } catch (error) {
    console.error('[v0] Error fetching user reviews:', error)
    return { reviews: [], error: String(error) }
  }
}
