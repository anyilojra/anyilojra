import { db } from './client'
import { newsletter_subscribers } from './schema'
import { eq } from 'drizzle-orm'

export async function subscribeNewsletter(email: string) {
  try {
    // Check if already subscribed
    const existing = await db
      .select()
      .from(newsletter_subscribers)
      .where(eq(newsletter_subscribers.email, email))

    if (existing[0]) {
      if (existing[0].subscribed) {
        return { subscriber: existing[0], error: 'Already subscribed' }
      }
      // Resubscribe
      const updated = await db
        .update(newsletter_subscribers)
        .set({ subscribed: true, updatedAt: new Date() })
        .where(eq(newsletter_subscribers.email, email))
        .returning()

      return { subscriber: updated[0], error: null }
    }

    // Create new subscription
    const id = `newsub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const created = await db
      .insert(newsletter_subscribers)
      .values({
        id,
        email,
        subscribed: true,
      })
      .returning()

    return { subscriber: created[0], error: null }
  } catch (error) {
    console.error('[v0] Error subscribing to newsletter:', error)
    return { subscriber: null, error: String(error) }
  }
}

export async function unsubscribeNewsletter(email: string) {
  try {
    const updated = await db
      .update(newsletter_subscribers)
      .set({ subscribed: false, updatedAt: new Date() })
      .where(eq(newsletter_subscribers.email, email))
      .returning()

    return { subscriber: updated[0], error: null }
  } catch (error) {
    console.error('[v0] Error unsubscribing from newsletter:', error)
    return { subscriber: null, error: String(error) }
  }
}

export async function getSubscribers(limit = 100, offset = 0) {
  try {
    const subscribers = await db
      .select()
      .from(newsletter_subscribers)
      .limit(limit)
      .offset(offset)

    return { subscribers, error: null }
  } catch (error) {
    console.error('[v0] Error fetching subscribers:', error)
    return { subscribers: [], error: String(error) }
  }
}

export async function getActiveSubscribers(limit = 100, offset = 0) {
  try {
    const subscribers = await db
      .select()
      .from(newsletter_subscribers)
      .where(eq(newsletter_subscribers.subscribed, true))
      .limit(limit)
      .offset(offset)

    return { subscribers, error: null }
  } catch (error) {
    console.error('[v0] Error fetching active subscribers:', error)
    return { subscribers: [], error: String(error) }
  }
}

export async function isSubscribed(email: string) {
  try {
    const subscriber = await db
      .select()
      .from(newsletter_subscribers)
      .where(eq(newsletter_subscribers.email, email))

    return subscriber[0]?.subscribed || false
  } catch (error) {
    console.error('[v0] Error checking subscription:', error)
    return false
  }
}
