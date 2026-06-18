import { createClient } from "@/utils/supabase/client"

export interface NewsletterSubscriber {
  id?: string
  first_name: string
  last_name: string
  email: string
  gender?: string
  discount_code?: string
  created_at?: string
}

const DISCOUNT_CODE = "VZ15OFF"

/**
 * Verifica si el email ya está suscrito.
 * Retorna true si ya existe en la BD.
 */
export async function isEmailSubscribed(email: string): Promise<boolean> {
  const supabase = createClient()
  if (!supabase) return false

  const { data } = await supabase
    .from("newsletter_subscribers")
    .select("id")
    .eq("email", email.toLowerCase().trim())
    .limit(1)

  return !!(data && data.length > 0)
}

/**
 * Registra un nuevo suscriptor y retorna el código de descuento.
 * Si el email ya existe, retorna error.
 */
export async function subscribeNewsletter(
  subscriber: Omit<NewsletterSubscriber, "id" | "discount_code" | "created_at">
): Promise<{ code: string | null; error: string | null }> {
  const supabase = createClient()
  if (!supabase) {
    return { code: null, error: "No se pudo conectar a la base de datos." }
  }

  const emailNormalized = subscriber.email.toLowerCase().trim()

  // Verificar si ya existe
  const alreadySubscribed = await isEmailSubscribed(emailNormalized)
  if (alreadySubscribed) {
    return {
      code: null,
      error: "Este correo ya tiene un código de descuento asignado.",
    }
  }

  const { error } = await supabase.from("newsletter_subscribers").insert([
    {
      first_name: subscriber.first_name.trim(),
      last_name: subscriber.last_name.trim(),
      email: emailNormalized,
      gender: subscriber.gender || null,
      discount_code: DISCOUNT_CODE,
    },
  ])

  if (error) {
    if (error.code === "23505") {
      return {
        code: null,
        error: "Este correo ya tiene un código de descuento asignado.",
      }
    }
    console.error("Error subscribing newsletter:", error)
    return { code: null, error: "Ocurrió un error. Inténtalo de nuevo." }
  }

  // Enviar email de bienvenida con el código
  try {
    await fetch("/api/newsletter-welcome", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailNormalized,
        first_name: subscriber.first_name.trim(),
        gender: subscriber.gender || "femenino",
        code: DISCOUNT_CODE,
      }),
    })
  } catch (e) {
    console.error("No se pudo enviar email de bienvenida:", e)
  }

  return { code: DISCOUNT_CODE, error: null }
}