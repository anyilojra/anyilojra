"use client"

import { useState, useEffect } from "react"
import { Star, CheckCircle2, Loader2 } from "lucide-react"
import { getProductReviews, submitReview, type Review } from "@/lib/supabase-reviews"

// ── Estrellas interactivas o de solo lectura ──────────────────────────────────

function StarRating({
  rating,
  interactive = false,
  size = "md",
  onChange,
}: {
  rating: number
  interactive?: boolean
  size?: "sm" | "md"
  onChange?: (r: number) => void
}) {
  const [hovered, setHovered] = useState(0)
  const dim = size === "sm" ? "w-4 h-4" : "w-5 h-5"

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          onClick={() => interactive && onChange?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={interactive ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default pointer-events-none"}
          aria-label={interactive ? `${star} estrella${star !== 1 ? "s" : ""}` : undefined}
        >
          <Star
            className={`${dim} transition-colors ${
              star <= (hovered || rating)
                ? "fill-[#c8952a] text-[#c8952a]"
                : "text-[#e8dfd3]"
            }`}
          />
        </button>
      ))}
    </div>
  )
}

// ── Barra de distribución de ratings ─────────────────────────────────────────

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-3 text-sm font-serif">
      <span className="text-muted-foreground w-12 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-[#e8dfd3] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#c8952a] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-muted-foreground w-6 text-right shrink-0">{count}</span>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    rating: 0,
    comment: "",
  })

  useEffect(() => {
    getProductReviews(productId).then((data) => {
      setReviews(data)
      setLoading(false)
    })
  }, [productId])

  // Métricas
  const total = reviews.length
  const avgRating = total
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10
    : 0
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    label: `${star} ★`,
    count: reviews.filter((r) => r.rating === star).length,
  }))

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setFormError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.rating === 0) {
      setFormError("Por favor selecciona una calificación.")
      return
    }
    if (!form.customer_name.trim() || !form.customer_email.trim()) {
      setFormError("Nombre y correo son obligatorios.")
      return
    }

    setSubmitting(true)
    setFormError("")

    const { error } = await submitReview({
      product_id: productId,
      customer_name: form.customer_name.trim(),
      customer_email: form.customer_email.trim().toLowerCase(),
      rating: form.rating,
      comment: form.comment.trim(),
    })

    setSubmitting(false)

    if (error) {
      setFormError(error)
    } else {
      setSubmitted(true)
      setShowForm(false)
    }
  }

  return (
    <section className="border-t border-[#e8dfd3] pt-16 pb-8">
      {/* Encabezado */}
      <div className="flex items-start justify-between mb-10 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[#c8952a] text-xl">✦</span>
            <div className="w-10 h-px bg-[#c8952a]" />
          </div>
          <h2 className="font-sans text-2xl md:text-3xl font-bold text-foreground">
            Opiniones
          </h2>
          {total > 0 && (
            <div className="flex items-center gap-3 mt-2">
              <StarRating rating={Math.round(avgRating)} />
              <span className="font-serif text-muted-foreground text-sm">
                {avgRating} sobre 5 · {total} opinión{total !== 1 ? "es" : ""}
              </span>
            </div>
          )}
        </div>

        {!submitted && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-6 py-2.5 border border-[#c8952a] text-[#c8952a] font-serif text-sm
                       rounded-sm hover:bg-[#c8952a] hover:text-white transition-colors shrink-0"
          >
            {showForm ? "Cancelar" : "Escribir opinión"}
          </button>
        )}
      </div>

      {/* Resumen con barras — solo si hay reseñas */}
      {total >= 3 && (
        <div className="mb-10 p-6 bg-[#fdf8f0] border border-[#e8dfd3] rounded-sm max-w-sm">
          <div className="flex items-center gap-4 mb-4">
            <span className="font-sans text-4xl font-bold text-foreground">{avgRating}</span>
            <div>
              <StarRating rating={Math.round(avgRating)} />
              <p className="font-serif text-xs text-muted-foreground mt-1">
                Basado en {total} opiniones
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {distribution.map((d) => (
              <RatingBar key={d.label} label={d.label} count={d.count} total={total} />
            ))}
          </div>
        </div>
      )}

      {/* Confirmación de envío */}
      {submitted && (
        <div className="mb-8 p-4 bg-[#fdf8f0] border border-[#e8dfd3] rounded-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#c8952a] shrink-0 mt-0.5" />
          <div>
            <p className="font-sans text-sm font-semibold text-foreground">
              ¡Gracias por tu opinión!
            </p>
            <p className="font-serif text-sm text-muted-foreground mt-0.5">
              Será publicada una vez que la revisemos. Normalmente toma menos de 24 horas.
            </p>
          </div>
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-12 p-6 border border-[#e8dfd3] rounded-sm bg-white space-y-5"
        >
          <h3 className="font-sans font-bold text-foreground">Tu opinión sobre este producto</h3>

          {/* Rating */}
          <div>
            <label className="block text-xs font-sans uppercase tracking-wider text-muted-foreground mb-2">
              Calificación <span className="text-[#c8952a]">*</span>
            </label>
            <StarRating
              rating={form.rating}
              interactive
              onChange={(r) => {
                setForm((p) => ({ ...p, rating: r }))
                setFormError("")
              }}
            />
          </div>

          {/* Nombre y Email */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="review-name"
                className="block text-xs font-sans uppercase tracking-wider text-muted-foreground mb-1"
              >
                Nombre <span className="text-[#c8952a]">*</span>
              </label>
              <input
                id="review-name"
                name="customer_name"
                value={form.customer_name}
                onChange={handleInput}
                placeholder="Tu nombre"
                className="w-full px-3 py-2.5 border border-[#e8dfd3] rounded-sm font-serif text-sm
                           text-foreground placeholder:text-muted-foreground bg-background
                           focus:outline-none focus:border-[#c8952a] transition-colors"
                required
              />
            </div>
            <div>
              <label
                htmlFor="review-email"
                className="block text-xs font-sans uppercase tracking-wider text-muted-foreground mb-1"
              >
                Correo electrónico <span className="text-[#c8952a]">*</span>
              </label>
              <input
                id="review-email"
                name="customer_email"
                type="email"
                value={form.customer_email}
                onChange={handleInput}
                placeholder="tu@correo.com"
                className="w-full px-3 py-2.5 border border-[#e8dfd3] rounded-sm font-serif text-sm
                           text-foreground placeholder:text-muted-foreground bg-background
                           focus:outline-none focus:border-[#c8952a] transition-colors"
                required
              />
            </div>
          </div>

          {/* Comentario */}
          <div>
            <label
              htmlFor="review-comment"
              className="block text-xs font-sans uppercase tracking-wider text-muted-foreground mb-1"
            >
              Comentario <span className="text-muted-foreground font-normal normal-case">(opcional)</span>
            </label>
            <textarea
              id="review-comment"
              name="comment"
              value={form.comment}
              onChange={handleInput}
              rows={3}
              placeholder="Cuéntanos tu experiencia con el producto..."
              className="w-full px-3 py-2.5 border border-[#e8dfd3] rounded-sm font-serif text-sm
                         text-foreground placeholder:text-muted-foreground bg-background
                         focus:outline-none focus:border-[#c8952a] transition-colors resize-none"
            />
          </div>

          {/* Error */}
          {formError && (
            <p className="text-sm font-serif text-red-600">{formError}</p>
          )}

          {/* Nota de privacidad */}
          <p className="text-xs font-serif text-muted-foreground">
            Tu correo no será publicado. Solo lo usamos para verificar si eres cliente.
          </p>

          {/* Botón */}
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-7 py-3 bg-[#c8952a] text-white font-serif text-sm
                       rounded-sm hover:bg-[#b07e22] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? "Enviando..." : "Enviar opinión"}
          </button>
        </form>
      )}

      {/* Lista de reseñas */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-[#c8952a]" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-[#e8dfd3] rounded-sm">
          <span className="text-3xl mb-3 block">✦</span>
          <p className="font-serif text-muted-foreground text-sm">
            Aún no hay opiniones para este producto.
          </p>
          <p className="font-serif text-muted-foreground text-sm mt-1">
            ¡Sé el primero en compartir tu experiencia!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-[#e8dfd3] pb-8 last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Avatar inicial */}
                  <div className="w-9 h-9 rounded-full bg-[#f5efe6] flex items-center justify-center shrink-0">
                    <span className="font-sans text-sm font-bold text-[#c8952a]">
                      {review.customer_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-sans font-semibold text-foreground text-sm">
                        {review.customer_name}
                      </span>
                      {review.verified_purchase && (
                        <span className="inline-flex items-center gap-1 text-xs font-serif text-[#c8952a]
                                         border border-[#c8952a]/30 bg-[#fdf8f0] px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Compra verificada
                        </span>
                      )}
                    </div>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                </div>
                <span className="text-xs font-serif text-muted-foreground shrink-0">
                  {new Date(review.created_at).toLocaleDateString("es-CO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              {review.comment && (
                <p className="font-serif text-muted-foreground text-sm leading-relaxed mt-3 ml-12">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
