"use client"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { serverGetOrderByShortId } from "./actions"
import type { Order } from "@/lib/db/schema"
import {
  Search,
  Package,
  CheckCircle2,
  Truck,
  Home,
  Clock,
  ChevronLeft,
  Copy,
  Check,
  RotateCcw,
} from "lucide-react"

type TrackingStep = {
  key: Order["status"]
  label: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
}

const STEPS: TrackingStep[] = [
  {
    key: "pending",
    label: "Pedido Recibido",
    description: "Hemos recibido tu pedido y estamos esperando la confirmación del pago.",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-300",
  },
  {
    key: "confirmed",
    label: "En Preparación",
    description: "¡Pago confirmado! Estamos preparando tu pedido con mucho cuidado.",
    icon: Package,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
  },
  {
    key: "shipped",
    label: "En Camino",
    description: "Tu pedido ya salió y está en camino hacia ti.",
    icon: Truck,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
  },
  {
    key: "delivered",
    label: "Entregado",
    description: "¡Tu pedido ha llegado! Esperamos que lo disfrutes.",
    icon: Home,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
  },
]

function getStepIndex(status: Order["status"]): number {
  const map: Record<string, number> = {
    pending: 0,
    confirmed: 1,
    shipped: 2,
    delivered: 3,
    cancelled: -1,
  }
  return map[status] ?? 0
}

function isReturnEligible(order: Order): boolean {
  if (order.status !== "delivered") return false
  if (!order.delivered_at) return false
  const deliveredAt = new Date(order.delivered_at)
  const thirtyDaysLater = new Date(deliveredAt.getTime() + 30 * 24 * 60 * 60 * 1000)
  return new Date() <= thirtyDaysLater
}

function daysLeftToReturn(order: Order): number {
  if (!order.delivered_at) return 0
  const deliveredAt = new Date(order.delivered_at)
  const thirtyDaysLater = new Date(deliveredAt.getTime() + 30 * 24 * 60 * 60 * 1000)
  const msLeft = thirtyDaysLater.getTime() - Date.now()
  return Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)))
}

export default function SeguimientoPage() {
  const [inputCode, setInputCode] = useState("")
  const [order, setOrder] = useState<(Order & { items: any[] }) | null>(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputCode.trim()) return
    setLoading(true)
    setNotFound(false)
    setOrder(null)
    const result = await serverGetOrderByShortId(inputCode.trim())
    if (result.order) {
      setOrder(result.order)
    } else {
      setNotFound(true)
    }
    setLoading(false)
  }

  const handleCopy = () => {
    if (order?.short_id) {
      navigator.clipboard.writeText(order.short_id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRefresh = async () => {
    if (!order?.short_id) return
    setLoading(true)
    const result = await serverGetOrderByShortId(order.short_id)
    if (result.order) {
      setOrder(result.order)
    }
    setLoading(false)
  }

  const currentStep = order ? getStepIndex(order.status) : -1
  const isCancelled = order?.status === "cancelled"

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-28 pb-20 px-4 md:px-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-serif mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-primary text-xl">✦</span>
            <div className="w-8 h-px bg-primary" />
          </div>
          <h1 className="font-sans text-3xl md:text-4xl font-bold text-foreground mb-2">
            Seguir mi pedido
          </h1>
          <p className="font-serif text-muted-foreground">
            Ingresa tu código de pedido para ver el estado de tu envío.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-10">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Ej: NVD-4821"
                className="w-full border border-border rounded-sm px-4 py-3 font-sans text-lg tracking-widest text-foreground bg-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all uppercase"
                maxLength={8}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !inputCode.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-serif text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-50 rounded-sm"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Buscar</span>
            </button>
          </div>
        </form>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-serif text-muted-foreground">Buscando tu pedido...</p>
          </div>
        )}

        {/* Not Found */}
        {notFound && !loading && (
          <div className="text-center py-12 border border-border rounded-lg">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="font-sans font-semibold text-foreground mb-2">Pedido no encontrado</p>
            <p className="font-serif text-sm text-muted-foreground">
              Verifica el código e inténtalo de nuevo. Recuerda usar el formato{" "}
              <span className="font-mono font-semibold">XXX-0000</span>.
            </p>
          </div>
        )}

        {/* Order Found */}
        {order && !loading && (
          <div className="space-y-6">
            {/* Order ID Card */}
            <div className="flex items-center justify-between bg-card border border-border rounded-lg p-5">
              <div>
                <p className="text-xs font-serif text-muted-foreground uppercase tracking-wider mb-1">
                  Código de pedido
                </p>
                <p className="font-sans text-2xl font-bold text-foreground tracking-widest">
                  {order.short_id}
                </p>
                <p className="text-xs font-serif text-muted-foreground mt-1">
                  Realizado el {formatDate(order.created_at)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  title="Copiar código"
                  className="flex items-center gap-2 px-3 py-2 border border-border rounded-sm text-sm font-serif text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  <span className="hidden sm:inline">{copied ? "¡Copiado!" : "Copiar"}</span>
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  title="Actualizar estado del pedido"
                  className="flex items-center gap-2 px-3 py-2 border border-border rounded-sm text-sm font-serif text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Actualizar</span>
                </button>
              </div>
            </div>

            {/* Cancelled State */}
            {isCancelled ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="font-sans font-semibold text-red-700 mb-1">Pedido Cancelado</p>
                <p className="font-serif text-sm text-red-600">
                  Este pedido fue cancelado. Si tienes dudas, contáctanos.
                </p>
              </div>
            ) : (
              /* Timeline */
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-sans font-semibold text-foreground mb-6">Estado del pedido</h2>
                <div className="space-y-0">
                  {STEPS.map((step, index) => {
                    const isCompleted = index < currentStep
                    const isActive = index === currentStep
                    const isPending = index > currentStep
                    const Icon = step.icon
                    const isLast = index === STEPS.length - 1

                    return (
                      <div key={step.key} className="flex gap-4">
                        {/* Icon + line */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-all ${
                              isCompleted
                                ? "bg-primary border-primary text-primary-foreground"
                                : isActive
                                ? `${step.bgColor} ${step.borderColor} ${step.color}`
                                : "bg-muted border-border text-muted-foreground"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <Icon className="w-5 h-5" />
                            )}
                          </div>
                          {!isLast && (
                            <div
                              className={`w-0.5 flex-1 my-1 min-h-[2rem] ${
                                isCompleted ? "bg-primary" : "bg-border"
                              }`}
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
                          <p
                            className={`font-sans font-semibold mb-0.5 ${
                              isActive
                                ? step.color
                                : isCompleted
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {step.label}
                          </p>
                          <p
                            className={`font-serif text-sm ${
                              isActive || isCompleted
                                ? "text-muted-foreground"
                                : "text-muted-foreground/50"
                            }`}
                          >
                            {isActive || isCompleted ? step.description : "Próximamente..."}
                          </p>
                          {isActive && (
                            <span
                              className={`inline-block mt-2 px-2 py-0.5 text-xs font-serif rounded-full ${step.bgColor} ${step.color} border ${step.borderColor}`}
                            >
                              Estado actual
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Customer Info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-lg p-5">
                <p className="text-xs font-serif text-muted-foreground uppercase tracking-wider mb-3">
                  Dirección de envío
                </p>
                <p className="font-sans font-medium text-foreground">{order.customer_name}</p>
                <p className="font-serif text-sm text-muted-foreground mt-1">
                  {order.shipping_address}
                  <br />
                  {order.shipping_city}, {order.shipping_department}
                  <br />
                  Colombia
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-5">
                <p className="text-xs font-serif text-muted-foreground uppercase tracking-wider mb-3">
                  Resumen del pedido
                </p>
                <div className="space-y-1">
                  {(order.items ?? []).map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="font-serif text-muted-foreground truncate max-w-[140px]">
                        {item.product_name} ×{item.quantity}
                      </span>
                      <span className="font-sans font-medium text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 mt-2 flex justify-between">
                    <span className="font-sans font-semibold text-foreground text-sm">Total</span>
                    <span className="font-sans font-bold text-primary">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Return Button */}
            {isReturnEligible(order) && !order.has_return && (
              <div className="bg-card border border-border rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-sans font-semibold text-foreground mb-0.5">
                    ¿Necesitas hacer una devolución?
                  </p>
                  <p className="font-serif text-sm text-muted-foreground">
                    Tienes{" "}
                    <span className="font-semibold text-foreground">
                      {daysLeftToReturn(order)} día{daysLeftToReturn(order) !== 1 ? "s" : ""}
                    </span>{" "}
                    restantes para solicitar una devolución o cambio.
                  </p>
                </div>
                <Link
                  href={`/devoluciones/solicitar?order=${order.short_id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-sans text-sm font-semibold tracking-wide rounded hover:bg-primary/90 transition-colors shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                  Iniciar Devolución
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
