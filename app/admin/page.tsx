"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { serverGetOrders, serverGetReturns } from "@/app/actions/db"
import {
  LogOut,
  Package,
  CreditCard,
  Mail,
  BarChart2,
  RotateCcw,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  XCircle,
  Box,
  Receipt,
  Store,
  Settings,
} from "lucide-react"

type MetricsPeriod = "day" | "week" | "month"
type Order = Awaited<ReturnType<typeof serverGetOrders>>['orders'][number]
type Return = Awaited<ReturnType<typeof serverGetReturns>>['returns'][number]

function startOf(period: MetricsPeriod): Date {
  const now = new Date()
  if (period === "day") {
    now.setHours(0, 0, 0, 0)
    return now
  }
  if (period === "week") {
    const day = now.getDay()
    now.setDate(now.getDate() - day)
    now.setHours(0, 0, 0, 0)
    return now
  }
  now.setDate(1)
  now.setHours(0, 0, 0, 0)
  return now
}

function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value)
}

function useFinancialMetrics(orders: Order[], period: MetricsPeriod) {
  return useMemo(() => {
    const since = startOf(period)
    const revenueStatuses = ["delivered", "confirmed", "shipped"]
    const periodOrders = orders.filter((o) => new Date(o.createdAt!) >= since)
    const revenueOrders = periodOrders.filter((o) => revenueStatuses.includes(o.status))
    const returnedAmount = 0 // Calcular desde tabla returns si es necesario
    const totalRevenue = revenueOrders.reduce((sum, o) => sum + (o.total ?? 0), 0) - returnedAmount
    const confirmedCount = revenueOrders.length
    const avgTicket = confirmedCount > 0 ? totalRevenue / confirmedCount : 0
    const cancelledCount = periodOrders.filter((o) => o.status === "cancelled").length
    const cancellationRate = periodOrders.length > 0 ? (cancelledCount / periodOrders.length) * 100 : 0
    const pendingCount = periodOrders.filter((o) => o.status === "pending").length

    return {
      totalRevenue,
      avgTicket,
      cancellationRate,
      periodOrdersCount: periodOrders.length,
      cancelledCount,
      pendingCount,
      confirmedCount,
    }
  }, [orders, period])
}

const periodLabel: Record<MetricsPeriod, string> = {
  day: "hoy",
  week: "esta semana",
  month: "este mes",
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [returns, setReturns] = useState<Return[]>([])
  const [loading, setLoading] = useState(true)
  const [metricsPeriod, setMetricsPeriod] = useState<MetricsPeriod>("month")

  const metrics = useFinancialMetrics(orders, metricsPeriod)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [ordersResult, returnsResult] = await Promise.all([
        serverGetOrders(),
        serverGetReturns().catch(() => ({ returns: [], error: null })),
      ])
      setOrders(ordersResult.orders || [])
      setReturns(returnsResult.returns || [])
    } catch (err) {
      console.error("[v0] Error loading data:", err)
    }
    setLoading(false)
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/signout", { method: "POST" })
    } catch (err) {
      console.log('[v0] Logout error')
    }
    localStorage.removeItem("nevada_admin_auth")
    localStorage.removeItem("nevada_admin_email")
    router.push("/admin/login")
  }

  const pendingReturns = returns.filter(
    (r) => r.status === "pending" || r.status === "approved"
  ).length

  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 5)

  return (
    <main className="min-h-screen bg-background">
      <div className="pt-8 pb-16 px-4 md:px-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo-nevada.png"
                alt="Nevada"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
              <div>
                <h1 className="font-sans text-2xl md:text-3xl font-bold text-foreground leading-none">
                  Panel de Administración
                </h1>
                <p className="text-sm text-muted-foreground font-serif mt-0.5">Nevada</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/productos"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-serif text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors rounded-sm"
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Administrar Productos</span>
            </Link>
            <Link
              href="/admin/venta-tienda"
              className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground font-serif text-sm uppercase tracking-wider hover:bg-accent/90 transition-colors rounded-sm"
            >
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Venta en Tienda</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 border border-border text-foreground font-serif text-sm uppercase tracking-wider hover:bg-muted transition-colors rounded-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>

        {/* KPIs Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans font-semibold text-lg text-foreground">Métricas Financieras</h2>
            <div className="flex gap-2">
              {(["day", "week", "month"] as MetricsPeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setMetricsPeriod(p)}
                  className={`px-3 py-1.5 text-xs font-serif rounded-sm transition-colors ${
                    metricsPeriod === p
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {p === "day" ? "Hoy" : p === "week" ? "Esta semana" : "Este mes"}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Ingresos */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xs text-emerald-600 font-serif">Ingresos {periodLabel[metricsPeriod]}</p>
                </div>
                <p className="text-xl font-bold text-emerald-800 leading-none">
                  {formatCOP(metrics.totalRevenue)}
                </p>
                <p className="text-xs text-emerald-600 font-serif mt-1">
                  {metrics.confirmedCount} pedido{metrics.confirmedCount !== 1 ? "s" : ""} confirmado{metrics.confirmedCount !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Ticket promedio */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-xs text-blue-600 font-serif">Ticket promedio</p>
                </div>
                <p className="text-xl font-bold text-blue-800 leading-none">
                  {metrics.avgTicket > 0 ? formatCOP(metrics.avgTicket) : "—"}
                </p>
                <p className="text-xs text-blue-600 font-serif mt-1">por pedido confirmado</p>
              </div>

              {/* Pedidos */}
              <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-violet-600" />
                  </div>
                  <p className="text-xs text-violet-600 font-serif">Pedidos {periodLabel[metricsPeriod]}</p>
                </div>
                <p className="text-xl font-bold text-violet-800 leading-none">
                  {metrics.periodOrdersCount}
                </p>
                <p className="text-xs text-violet-600 font-serif mt-1">
                  {metrics.pendingCount} pendiente{metrics.pendingCount !== 1 ? "s" : ""} de pago
                </p>
              </div>

              {/* Cancelaciones */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <p className="text-xs text-red-600 font-serif">Cancelaciones</p>
                </div>
                <p className="text-xl font-bold text-red-800 leading-none">
                  {metrics.cancellationRate.toFixed(1)}%
                </p>
                <p className="text-xs text-red-600 font-serif mt-1">
                  {metrics.cancelledCount} de {metrics.periodOrdersCount} pedidos
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Navigation Tabs */}
        <section className="mb-10">
          <h2 className="font-sans font-semibold text-lg text-foreground mb-4">Gestión</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Pagos */}
            <Link
              href="/admin/pagos"
              className="group flex flex-col items-center gap-3 p-6 bg-card border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <CreditCard className="w-6 h-6 text-green-700" />
              </div>
              <div className="text-center">
                <p className="font-sans font-semibold text-foreground text-sm">Pagos</p>
                <p className="text-xs text-muted-foreground font-serif mt-0.5">Gestión de pedidos</p>
              </div>
              {!loading && metrics.pendingCount > 0 && (
                <span className="text-xs bg-amber-100 text-amber-800 border border-amber-200 rounded-full px-2 py-0.5 font-serif">
                  {metrics.pendingCount} pendiente{metrics.pendingCount !== 1 ? "s" : ""}
                </span>
              )}
            </Link>

            {/* Devoluciones */}
            <Link
              href="/admin/devoluciones"
              className="group flex flex-col items-center gap-3 p-6 bg-card border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <RotateCcw className="w-6 h-6 text-orange-700" />
              </div>
              <div className="text-center">
                <p className="font-sans font-semibold text-foreground text-sm">Devoluciones</p>
                <p className="text-xs text-muted-foreground font-serif mt-0.5">Gestión de retornos</p>
              </div>
              {!loading && pendingReturns > 0 && (
                <span className="text-xs bg-orange-100 text-orange-800 border border-orange-200 rounded-full px-2 py-0.5 font-serif">
                  {pendingReturns} activa{pendingReturns !== 1 ? "s" : ""}
                </span>
              )}
            </Link>

            {/* Mensajes */}
            <Link
              href="/admin/mensajes"
              className="group flex flex-col items-center gap-3 p-6 bg-card border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Mail className="w-6 h-6 text-blue-700" />
              </div>
              <div className="text-center">
                <p className="font-sans font-semibold text-foreground text-sm">Mensajes</p>
                <p className="text-xs text-muted-foreground font-serif mt-0.5">Contacto de clientes</p>
              </div>
            </Link>

            {/* Reportes */}
            <Link
              href="/admin/reportes"
              className="group flex flex-col items-center gap-3 p-6 bg-card border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
            >
              <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                <BarChart2 className="w-6 h-6 text-violet-700" />
              </div>
              <div className="text-center">
                <p className="font-sans font-semibold text-foreground text-sm">Reportes</p>
                <p className="text-xs text-muted-foreground font-serif mt-0.5">Análisis y exportación</p>
              </div>
            </Link>

            {/* Costos */}
            <Link
              href="/admin/costos"
              className="group flex flex-col items-center gap-3 p-6 bg-card border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                <TrendingUp className="w-6 h-6 text-emerald-700" />
              </div>
              <div className="text-center">
                <p className="font-sans font-semibold text-foreground text-sm">Costos</p>
                <p className="text-xs text-muted-foreground font-serif mt-0.5">Gestión de costos</p>
              </div>
            </Link>

            {/* Gastos */}
            <Link
              href="/admin/gastos"
              className="group flex flex-col items-center gap-3 p-6 bg-card border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
            >
              <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center group-hover:bg-rose-200 transition-colors">
                <Receipt className="w-6 h-6 text-rose-700" />
              </div>
              <div className="text-center">
                <p className="font-sans font-semibold text-foreground text-sm">Gastos</p>
                <p className="text-xs text-muted-foreground font-serif mt-0.5">Registro de gastos</p>
              </div>
            </Link>
            {/* Descuentos */}
            <Link
              href="/admin/configuracion"
              className="group flex flex-col items-center gap-3 p-6 bg-card border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
            >
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                <Settings className="w-6 h-6 text-slate-700" />
              </div>
              <div className="text-center">
                <p className="font-sans font-semibold text-foreground text-sm">Configuración</p>
                <p className="text-xs text-muted-foreground font-serif mt-0.5">Colores, logos y empresa</p>
              </div>
            </Link>
            {/* Newsletter */}
            <Link
              href="/admin/newsletter"
              className="group flex flex-col items-center gap-3 p-6 bg-card border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
            >
              <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                <Mail className="w-6 h-6 text-sky-700" />
              </div>
              <div className="text-center">
                <p className="font-sans font-semibold text-foreground text-sm">Newsletter</p>
                <p className="text-xs text-muted-foreground font-serif mt-0.5">Envío de correos</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Recent Orders Preview */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans font-semibold text-lg text-foreground">Pedidos Recientes</h2>
            <Link
              href="/admin/pagos"
              className="text-sm text-primary font-serif hover:underline underline-offset-2"
            >
              Ver todos →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <Box className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground font-serif text-sm">No hay pedidos aún</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {recentOrders.map((order, idx) => {
                const statusColors: Record<string, string> = {
                  pending: "bg-amber-100 text-amber-800",
                  payment_confirmed: "bg-blue-100 text-blue-800",
                  shipped: "bg-violet-100 text-violet-800",
                  delivered: "bg-green-100 text-green-800",
                  cancelled: "bg-red-100 text-red-800",
                }
                const statusLabels: Record<string, string> = {
                  pending: "Pendiente",
                  payment_confirmed: "En Preparación",
                  shipped: "En Envío",
                  delivered: "Entregado",
                  cancelled: "Cancelado",
                }
                return (
                  <div
                    key={order.id}
                    className={`flex items-center justify-between px-5 py-4 ${
                      idx !== recentOrders.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-sans font-medium text-foreground text-sm truncate">
                          {order.customer_name}
                        </p>
                        <p className="text-xs text-muted-foreground font-serif">
                          #{(order.short_id ?? order.id ?? "").toString().toUpperCase().slice(-6)}
                          {" · "}
                          {order.createdAt
  ? new Date(order.createdAt).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
    })
  : "Sin fecha"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span
                        className={`hidden sm:inline text-xs px-2 py-0.5 rounded-full font-serif ${
                          statusColors[order.status] ?? "bg-muted text-foreground"
                        }`}
                      >
                        {statusLabels[order.status] ?? order.status}
                      </span>
                      <p className="font-sans font-semibold text-foreground text-sm">
                        {formatCOP(order.total ?? 0)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
