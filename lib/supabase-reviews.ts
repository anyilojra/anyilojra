import { createClient } from "@/utils/supabase/client"

export interface Review {
  id: string
  product_id: string
  customer_name: string
  customer_email: string
  rating: number
  comment?: string
  verified_purchase: boolean
  approved: boolean
  created_at: string
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  const supabase = createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from("reviews")
    .select("id, product_id, customer_name, rating, comment, verified_purchase, created_at")
    .eq("product_id", productId)
    .eq("approved", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching reviews:", error.message)
    return []
  }

  return data || []
}

export async function submitReview(
  review: Pick<Review, "product_id" | "customer_name" | "customer_email" | "rating" | "comment">
): Promise<{ error: string | null }> {
  const supabase = createClient()
  if (!supabase) return { error: "No se pudo conectar a la base de datos" }

  // Verificar compra: buscar pedidos entregados de este cliente con este producto
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("order_id, orders!inner(customer_email, status)")
    .eq("product_id", review.product_id)
    .eq("orders.customer_email", review.customer_email)
    .eq("orders.status", "delivered")
    .limit(1)

  const verified_purchase = (orderItems?.length ?? 0) > 0

  const { error } = await supabase.from("reviews").insert([
    {
      product_id: review.product_id,
      customer_name: review.customer_name,
      customer_email: review.customer_email,
      rating: review.rating,
      comment: review.comment || null,
      verified_purchase,
      approved: false,
    },
  ])

  if (error) {
    console.error("Error submitting review:", error.message)
    return { error: "No se pudo enviar la reseña. Intenta de nuevo." }
  }

  return { error: null }
}

export async function getPendingReviews(): Promise<Review[]> {
  const supabase = createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("approved", false)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching pending reviews:", error.message)
    return []
  }

  return data || []
}

export async function getAllReviews(): Promise<Review[]> {
  const supabase = createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching all reviews:", error.message)
    return []
  }

  return data || []
}

export async function approveReview(id: string): Promise<boolean> {
  const supabase = createClient()
  if (!supabase) return false

  const { error } = await supabase
    .from("reviews")
    .update({ approved: true })
    .eq("id", id)

  if (error) {
    console.error("Error approving review:", error.message)
    return false
  }

  return true
}

export async function deleteReview(id: string): Promise<boolean> {
  const supabase = createClient()
  if (!supabase) return false

  const { error } = await supabase.from("reviews").delete().eq("id", id)

  if (error) {
    console.error("Error deleting review:", error.message)
    return false
  }

  return true
}
