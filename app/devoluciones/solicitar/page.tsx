"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { getOrderByShortId, type Order } from "@/lib/supabase-orders"
import {
  createReturn,
  type ReturnReason,
  type ReturnResolution,
  RETURN_REASON_LABELS,
  RETURN_RESOLUTION_LABELS,
} from "@/lib/supabase-returns"
import {
  ChevronLeft,
  RotateCcw,
  Package,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react"

// ─────────────────────────────────────────────────────────────
// Inner component (uses useSearchParams — must be inside Suspense)
// ─────────────────────────────────────────────────────────────

function SolicitarForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderCode = searchParams.get("order") ?? ""

  // ── State ──────────────────────────────────────────────────
  const [order, setOrder] = useState<Order | null>(null)
  const [loadingOrder, setLoadingOrder] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Form
  const [selectedItems, setSelectedItems] = useState<Record<number, boolean>>({})
  const [reason, setReason] = useState<ReturnReason>("defecto_fabrica")
  const [reasonDetail, setReasonDetail] = useState("")
  const [resolution, setResolution] = useState<ReturnResolution>("cambio_producto")

  // Submit
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // ── Load order ─────────────────────────────────────────────
  useEffect(() => {
    if (!orderCode) { setLoadingOrder(false); setNotFound(true); return }
    getOrderByShortId(orderCode).then((o) => {
      if (o) setOrder(o)
      else setNotFound(true)
      setLoadingOrder(false)
    })
  }, [orderCode])

  // ── Helpers ────────────────────────────────────────────────
  const formatPrice = (n: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n)

  const toggleItem = (idx: number) =>
    setSelectedItems((prev) => ({ ...prev, [idx]: !prev[idx] }))

  const selectedList = (order?.items ?? []).filter((_, i) => selectedItems[i])

  const totalAmount = selectedList.reduce((s, item) => s + item.price * item.quantity, 0)

  // ── Submit ─────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (selectedList.length === 0) {
      setError("Selecciona al menos un producto para devolver.")
      return
    }

    if (!order) return
    setSubmitting(true)

    const returnItems = selectedList.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      price: item.price,
      subtotal: item.price * item.quantity,
    }))

    const { data, error: createError } = await createReturn(
      {
        order_id: order.id!,
        order_short_id: order.short_id!,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        reason,
        reason_detail: reasonDetail.trim() || undefined,
        resolution,
        total_amount: totalAmount,
      },
      returnItems
    )

    setSubmitting(false)

    if (createError || !data) {
      setError("Ocurrió un error al enviar tu solicitud. Intenta de nuevo.")
      return
    }

    setSuccess(data.short_id ?? "DEV-????")
  }

  // ── Eligibility check ──────────────────────────────────────
  function isEligible(o: Order): boolean {
    if (o.status !== "delivered") return false
    if (!o.delivered_at) return false
    const limit = new Date(new Date(o.delivered_at).getTime() + 30 * 24 * 60 * 60 * 1000)
    return new Date() <= limit
  }

  // ─────────────────────────────────────────────────────────────
  // Render: loading
  // ─────────────────────────────────────────────────────────────
  if (loadingOrder) {
    return (
      <div className="flex items-center justify-center py-32 text-muted-foreground gap-3">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="font-serif">Cargando pedido...</span>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────
  // Render: not found
  // ─────────────────────────────────────────────────────────────
  if (notFound || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center px-4">
        <Package className="w-12 h-12 text-muted-foreground opacity-40" />
        <p className="font-sans font-semibold text-foreground">Pedido no encontrado</p>
        <p className="font-serif text-sm text-muted-foreground max-w-xs">
          No pudimos encontrar el pedido <span className="font-mono font-semibold">{orderCode}</span>.
          Verifica el código e inténtalo desde la página de seguimiento.
        </p>
        <Link
          href="/seguimiento"
          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-sans text-sm font-semibold rounded hover:bg-primary/90 transition-colors"
        >
          Ir a Seguimiento
        </Link>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────
  // Render: not eligible
  // ─────────────────────────────────────────────────────────────
  if (!isEligible(order)) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center px-4">
        <AlertCircle className="w-12 h-12 text-yellow-500 opacity-80" />
        <p className="font-sans font-semibold text-foreground">Plazo de devolución vencido</p>
        <p className="font-serif text-sm text-muted-foreground max-w-sm">
          El pedido <span className="font-mono font-semibold">{order.short_id}</span> ya superó
          los 30 días desde la fecha de entrega. No es posible iniciar una devolución en línea.
          Si crees que esto es un error, contáctanos directamente.
        </p>
        <div className="flex gap-3 mt-2">
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-sans text-sm font-semibold rounded hover:bg-primary/90 transition-colors"
          >
            Contactar soporte
          </Link>
          <Link
            href="/seguimiento"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-foreground font-sans text-sm font-semibold rounded hover:bg-muted transition-colors"
          >
            Ver pedido
          </Link>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────
  // Render: success
  // ─────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-5 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <p className="font-sans font-bold text-xl text-foreground mb-1">
            ¡Solicitud enviada!
          </p>
          <p className="font-serif text-muted-foreground max-w-sm">
            Hemos recibido tu solicitud de devolución. En 24–48 horas hábiles te contactaremos
            con las instrucciones de envío.
          </p>
        </div>
        <div className="bg-muted border border-border rounded-lg px-6 py-4">
          <p className="text-xs text-muted-foreground font-serif mb-1">Número de solicitud</p>
          <p className="font-mono font-bold text-xl text-primary">{success}</p>
        </div>
        <Link
          href="/seguimiento"
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-foreground font-sans text-sm font-semibold rounded hover:bg-muted transition-colors"
        >
          Volver a Seguimiento
        </Link>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────
  // Render: form
  // ─────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Order summary */}
      <div className="bg-muted/40 border border-border rounded-lg p-5">
        <p className="text-xs font-serif text-muted-foreground uppercase tracking-wider mb-1">Pedido</p>
        <p className="font-sans font-bold text-lg text-foreground">{order.short_id}</p>
        <p className="font-serif text-sm text-muted-foreground">{order.customer_name} · {order.customer_email}</p>
      </div>

      {/* Step 1: Select products */}
      <div>
        <h2 className="font-sans font-semibold text-foreground mb-1">
          1. ¿Qué productos quieres devolver?
        </h2>
        <p className="font-serif text-sm text-muted-foreground mb-4">
          Selecciona uno o más productos del pedido.
        </p>
        <div className="space-y-3">
          {(order.items ?? []).map((item, i) => (
            <label
              key={i}
              className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedItems[i]
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <input
                type="checkbox"
                checked={!!selectedItems[i]}
                onChange={() => toggleItem(i)}
                className="w-4 h-4 accent-primary shrink-0"
              />
              {item.product_image && (
                <img
                  src={item.product_image}
                  alt={item.product_name}
                  className="w-12 h-12 object-cover rounded-md shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-sans font-medium text-foreground text-sm truncate">{item.product_name}</p>
                <p className="font-serif text-xs text-muted-foreground">
                  Talla: {item.size} · Color: {item.color} · Cant: {item.quantity}
                </p>
              </div>
              <p className="font-sans font-semibold text-foreground text-sm shrink-0">
                {formatPrice(item.price * item.quantity)}
              </p>
            </label>
          ))}
        </div>
        {selectedList.length > 0 && (
          <p className="text-right font-sans text-sm font-semibold text-primary mt-3">
            Total a devolver: {formatPrice(totalAmount)}
          </p>
        )}
      </div>

      {/* Step 2: Reason */}
      <div>
        <h2 className="font-sans font-semibold text-foreground mb-1">
          2. ¿Cuál es el motivo?
        </h2>
        <p className="font-serif text-sm text-muted-foreground mb-4">
          Selecciona la razón principal de tu devolución.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {(Object.keys(RETURN_REASON_LABELS) as ReturnReason[]).map((key) => (
            <label
              key={key}
              className={`flex items-center gap-3 p-3.5 border rounded-lg cursor-pointer transition-colors ${
                reason === key
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <input
                type="radio"
                name="reason"
                value={key}
                checked={reason === key}
                onChange={() => setReason(key)}
                className="accent-primary shrink-0"
              />
              <span className="font-serif text-sm text-foreground">{RETURN_REASON_LABELS[key]}</span>
            </label>
          ))}
        </div>
        <textarea
          value={reasonDetail}
          onChange={(e) => setReasonDetail(e.target.value)}
          placeholder="Describe con más detalle (opcional)..."
          className="mt-4 w-full border border-border rounded-lg p-3 text-sm bg-background text-foreground resize-none h-24 font-serif focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Step 3: Resolution */}
      <div>
        <h2 className="font-sans font-semibold text-foreground mb-1">
          3. ¿Cómo prefieres resolver esto?
        </h2>
        <p className="font-serif text-sm text-muted-foreground mb-4">
          Elige el tipo de compensación que prefieres.
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          {(Object.keys(RETURN_RESOLUTION_LABELS) as ReturnResolution[]).map((key) => (
            <label
              key={key}
              className={`flex flex-col gap-1 p-4 border rounded-lg cursor-pointer transition-colors ${
                resolution === key
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="resolution"
                  value={key}
                  checked={resolution === key}
                  onChange={() => setResolution(key)}
                  className="accent-primary shrink-0"
                />
                <span className="font-sans text-sm font-medium text-foreground">
                  {RETURN_RESOLUTION_LABELS[key]}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground font-sans font-semibold text-sm rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {submitting ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Enviando solicitud...</>
        ) : (
          <><RotateCcw className="w-4 h-4" /> Confirmar solicitud de devolución</>
        )}
      </button>

      <p className="text-center font-serif text-xs text-muted-foreground">
        Al enviar confirmas que los productos están en condiciones originales, sin uso y con etiquetas.
        Revisa nuestra{" "}
        <Link href="/devoluciones" className="underline hover:text-foreground transition-colors">
          política de devoluciones
        </Link>.
      </p>
    </form>
  )
}

// ─────────────────────────────────────────────────────────────
// Page wrapper
// ─────────────────────────────────────────────────────────────

export default function SolicitarDevolucionPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 px-4 max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <Link
            href="/seguimiento"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-serif mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver a seguimiento
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-primary text-xl">✦</span>
            <div className="w-8 h-px bg-primary" />
          </div>
          <h1 className="font-sans text-3xl font-bold text-foreground mb-2">
            Solicitar Devolución
          </h1>
          <p className="font-serif text-muted-foreground">
            Completa el formulario y nos pondremos en contacto en 24–48 horas hábiles.
          </p>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center py-32 text-muted-foreground gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-serif">Cargando...</span>
          </div>
        }>
          <SolicitarForm />
        </Suspense>
      </div>
    </main>
  )
}
