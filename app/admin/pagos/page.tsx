"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, CreditCard, Loader2, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { serverGetPendingOrders, serverUpdateOrderStatus } from "./actions"
import type { Order } from "@/lib/db/schema"

type OrderWithItems = Order & { items: any[] }

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente", icon: Clock, color: "text-yellow-600" },
  { value: "confirmed", label: "Pago Confirmado", icon: CheckCircle2, color: "text-blue-600" },
  { value: "shipped", label: "Enviado", icon: "🚚", color: "text-purple-600" },
  { value: "delivered", label: "Entregado", icon: "✓", color: "text-green-600" },
]

export default function AdminPagosPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    try {
      setLoading(true)
      const result = await serverGetPendingOrders()
      if (result.error) {
        setError(result.error)
      } else {
        setOrders(result.orders)
      }
    } catch (err) {
      setError("Error al cargar las órdenes")
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(orderId: string, newStatus: string) {
    try {
      setUpdating(orderId)
      setError(null)
      
      const result = await serverUpdateOrderStatus(orderId, newStatus)
      
      if (result.error) {
        console.error('[v0] Error updating order:', result.error)
        setError(result.error)
        setUpdating(null)
        return
      }
      
      // Update the order in the list with the new status
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus as any }
          : order
      ))
      setUpdating(null)
    } catch (err) {
      console.error('[v0] Error in handleStatusChange:', err)
      setError("Error al actualizar el estado: " + String(err))
      setUpdating(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-muted rounded-lg transition">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="font-sans text-2xl md:text-3xl font-bold text-foreground">Pagos</h1>
              <p className="text-sm text-muted-foreground font-serif mt-1">Gestión de pedidos y pagos</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-card border border-border rounded-lg p-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="ml-4 text-muted-foreground">Cargando órdenes...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="font-sans text-xl font-semibold text-foreground mb-2">Sin Pagos Pendientes</h2>
              <p className="text-muted-foreground text-center max-w-md">
                No hay órdenes pendientes. Todas las órdenes han sido procesadas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="font-sans text-lg font-semibold text-foreground mb-6">
                Órdenes Pendientes ({orders.length})
              </h2>
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-border rounded-lg p-6 hover:bg-muted/50 transition"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-sans font-semibold text-foreground">
                          Pedido: {order.short_id}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status === 'pending' ? 'PENDIENTE' :
                           order.status === 'confirmed' ? 'PAGO CONFIRMADO' :
                           order.status === 'shipped' ? 'ENVIADO' :
                           order.status === 'delivered' ? 'ENTREGADO' :
                           order.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Cliente: {order.customer_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Email: {order.customer_email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Teléfono: {order.customer_phone}
                      </p>
                      <p className="text-sm font-medium text-foreground mt-2">
                        Total: ${order.total.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="mb-4 bg-muted/50 rounded p-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">
                        ITEMS ({order.items.length})
                      </p>
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <p key={idx} className="text-sm text-foreground">
                            • {item.product_name} x{item.quantity}
                            {item.size && ` (Talla: ${item.size})`}
                            {item.color && ` (Color: ${item.color})`}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status Update */}
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <span className="text-sm font-medium text-muted-foreground">Cambiar estado:</span>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={updating === order.id}
                      className="text-sm border border-border rounded px-3 py-2 bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                    {updating === order.id && (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
