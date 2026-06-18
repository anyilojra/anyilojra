"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, Send, Users, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

interface Stats {
  total: number
  active: number
  inactive: number
}

type SendState = "idle" | "sending" | "success" | "error"

export default function NewsletterPage() {
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, inactive: 0 })
  const [loadingStats, setLoadingStats] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [sendState, setSendState] = useState<SendState>("idle")
  const [sendResult, setSendResult] = useState<{ sent?: number; failed?: number; error?: string } | null>(null)

  const [form, setForm] = useState({
    subject: "",
    message: "",
    buttonText: "",
    buttonUrl: "",
  })

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    setLoadingStats(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("newsletter_subscribers")
      .select("subscribed")

    if (data) {
      const active = data.filter((r) => r.subscribed).length
      setStats({ total: data.length, active, inactive: data.length - active })
    }
    setLoadingStats(false)
  }

  async function handleSend() {
    if (!form.subject.trim() || !form.message.trim()) return
    if (!confirm(`¿Enviar este newsletter a ${stats.active} suscriptores activos?`)) return

    setSendState("sending")
    setSendResult(null)

    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: form.subject,
          message: form.message,
          buttonText: form.buttonText || undefined,
          buttonUrl: form.buttonUrl || undefined,
        }),
      })
      const data = await res.json()

      if (data.ok) {
        setSendState("success")
        setSendResult({ sent: data.sent, failed: data.failed })
      } else {
        setSendState("error")
        setSendResult({ error: data.error })
      }
    } catch (e: any) {
      setSendState("error")
      setSendResult({ error: e.message })
    }
  }

  function resetForm() {
    setForm({ subject: "", message: "", buttonText: "", buttonUrl: "" })
    setSendState("idle")
    setSendResult(null)
    setShowPreview(false)
  }

  const hasContent = form.subject.trim() && form.message.trim()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 flex items-center gap-4">
        <Link
          href="/admin"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Admin
        </Link>
        <span className="text-border">/</span>
        <h1 className="font-sans text-lg font-semibold text-foreground">Newsletter</h1>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total suscriptores", value: stats.total, color: "text-foreground" },
            { label: "Activos (recibirán)", value: stats.active, color: "text-green-600" },
            { label: "Dados de baja", value: stats.inactive, color: "text-muted-foreground" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-lg p-5 text-center">
              <div className={`font-sans text-3xl font-bold ${stat.color} mb-1`}>
                {loadingStats ? "—" : stat.value}
              </div>
              <div className="font-serif text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Estado de envío exitoso */}
        {sendState === "success" && sendResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-5 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-sans font-semibold text-green-800">
                ¡Newsletter enviado con éxito!
              </p>
              <p className="font-serif text-sm text-green-700 mt-1">
                {sendResult.sent} correos enviados
                {sendResult.failed ? ` · ${sendResult.failed} fallidos` : ""}
              </p>
              <button
                onClick={resetForm}
                className="mt-3 text-sm text-green-700 underline hover:text-green-900"
              >
                Redactar otro newsletter
              </button>
            </div>
          </div>
        )}

        {/* Estado de error */}
        {sendState === "error" && sendResult?.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-sans font-semibold text-red-800">Error al enviar</p>
              <p className="font-serif text-sm text-red-700 mt-1">{sendResult.error}</p>
            </div>
          </div>
        )}

        {sendState !== "success" && (
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Editor */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Send className="w-4 h-4 text-primary" />
                <h2 className="font-sans font-semibold text-foreground">Redactar newsletter</h2>
              </div>

              {/* Asunto */}
              <div>
                <label className="block font-serif text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Asunto del correo *
                </label>
                <input
                  type="text"
                  placeholder="Ej: ¡Nueva colección disponible! 🌿"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 py-2.5 border border-border bg-background text-foreground text-sm font-serif focus:outline-none focus:ring-1 focus:ring-primary rounded-sm"
                />
              </div>

              {/* Mensaje */}
              <div>
                <label className="block font-serif text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Mensaje *
                </label>
                <textarea
                  rows={8}
                  placeholder={`Ej:\nHemos preparado algo especial para ti.\n\nNuestra nueva colección llega con piezas llenas de fe y elegancia, pensadas para acompañarte en cada momento.\n\nExplórala y encuentra tu favorita. ✨`}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3 py-2.5 border border-border bg-background text-foreground text-sm font-serif focus:outline-none focus:ring-1 focus:ring-primary rounded-sm resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Puedes usar saltos de línea para separar párrafos.
                </p>
              </div>

              {/* Botón CTA (opcional) */}
              <div className="border-t border-border pt-4 space-y-3">
                <p className="font-serif text-xs text-muted-foreground uppercase tracking-wider">
                  Botón de acción (opcional)
                </p>
                <input
                  type="text"
                  placeholder="Texto del botón — Ej: Ver colección"
                  value={form.buttonText}
                  onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                  className="w-full px-3 py-2.5 border border-border bg-background text-foreground text-sm font-serif focus:outline-none focus:ring-1 focus:ring-primary rounded-sm"
                />
                <input
                  type="url"
                  placeholder="URL — Ej: https://www.santizzima.com/mujer"
                  value={form.buttonUrl}
                  onChange={(e) => setForm({ ...form, buttonUrl: e.target.value })}
                  className="w-full px-3 py-2.5 border border-border bg-background text-foreground text-sm font-serif focus:outline-none focus:ring-1 focus:ring-primary rounded-sm"
                />
              </div>

              {/* Acciones */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  disabled={!hasContent}
                  className="flex items-center gap-2 px-4 py-2.5 border border-border text-sm font-serif text-foreground hover:border-primary hover:text-primary transition-colors rounded-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showPreview ? "Ocultar" : "Vista previa"}
                </button>

                <button
                  onClick={handleSend}
                  disabled={!hasContent || sendState === "sending" || stats.active === 0}
                  className="flex items-center gap-2 flex-1 justify-center px-4 py-2.5 bg-primary text-primary-foreground text-sm font-serif uppercase tracking-wider hover:bg-primary/90 transition-colors rounded-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {sendState === "sending" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar a {stats.active} personas
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Vista previa */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4 text-primary" />
                <h2 className="font-sans font-semibold text-foreground">Vista previa</h2>
              </div>

              {!showPreview || !hasContent ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Eye className="w-10 h-10 text-muted-foreground/30 mb-3" />
                  <p className="font-serif text-sm text-muted-foreground">
                    Completa el asunto y el mensaje,<br />
                    luego haz clic en "Vista previa"
                  </p>
                </div>
              ) : (
                <div
                  className="border border-border rounded overflow-auto"
                  style={{ maxHeight: "520px", fontSize: "11px" }}
                >
                  {/* Mini preview del email */}
                  <div style={{ fontFamily: "Georgia,serif", color: "#1a0a00", background: "#fff" }}>
                    {/* Header */}
                    <div style={{ background: "#c8952a", padding: "16px", textAlign: "center" }}>
                      <p style={{ color: "white", margin: 0, fontSize: "14px", letterSpacing: "2px" }}>
                        SANTIZZIMA
                      </p>
                      <p style={{ color: "rgba(255,255,255,0.8)", margin: "4px 0 0", fontSize: "10px", fontStyle: "italic" }}>
                        Fe, Moda y Propósito
                      </p>
                    </div>
                    {/* Saludo */}
                    <div style={{ background: "#f5efe6", padding: "12px 16px", borderBottom: "2px solid #c8952a", textAlign: "center" }}>
                      <p style={{ color: "#5c4a3a", margin: 0, fontSize: "11px" }}>
                        Hola <strong>María</strong> 🌿
                      </p>
                      <p style={{ color: "#1a0a00", margin: "6px 0 0", fontWeight: "bold", fontSize: "12px" }}>
                        {form.subject}
                      </p>
                    </div>
                    {/* Cuerpo */}
                    <div style={{ padding: "14px 16px", fontSize: "11px", lineHeight: 1.7, whiteSpace: "pre-line", borderBottom: "1px solid #f0e8db" }}>
                      {form.message}
                    </div>
                    {/* Botón CTA */}
                    {form.buttonText && (
                      <div style={{ padding: "14px 16px", textAlign: "center", borderBottom: "1px solid #f0e8db" }}>
                        <span style={{ display: "inline-block", padding: "8px 20px", background: "#c8952a", color: "white", fontSize: "10px", letterSpacing: "1.5px" }}>
                          {form.buttonText.toUpperCase()}
                        </span>
                      </div>
                    )}
                    {/* Footer */}
                    <div style={{ padding: "12px 16px", textAlign: "center" }}>
                      <p style={{ color: "#5c4a3a", fontSize: "9px", margin: "0 0 4px" }}>
                        ventas@santizzima.com · +57 300 849 8089
                      </p>
                      <p style={{ color: "#c8952a", fontSize: "10px", margin: "4px 0", fontStyle: "italic" }}>
                        ✦ Fe, Moda y Propósito ✦
                      </p>
                      <p style={{ color: "#9e8c7d", fontSize: "9px", margin: 0 }}>
                        Cancelar suscripción
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lista de suscriptores (resumen) */}
        <SubscribersList />
      </div>
    </div>
  )
}

// ── Tabla de suscriptores ──────────────────────────────────────
function SubscribersList() {
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("active")

  useEffect(() => {
    loadSubscribers()
  }, [])

  async function loadSubscribers() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("newsletter_subscribers")
      .select("id, first_name, last_name, email, gender, subscribed, created_at")
      .order("created_at", { ascending: false })
    setSubscribers(data || [])
    setLoading(false)
  }

  const filtered = subscribers.filter((s) => {
    if (filter === "active") return s.subscribed
    if (filter === "inactive") return !s.subscribed
    return true
  })

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h2 className="font-sans font-semibold text-foreground">Suscriptores</h2>
        </div>
        <div className="flex gap-1">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs font-serif rounded-sm transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:text-primary hover:border-primary"
              }`}
            >
              {f === "all" ? "Todos" : f === "active" ? "Activos" : "Bajas"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-center font-serif text-sm text-muted-foreground py-8">Cargando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center font-serif text-sm text-muted-foreground py-8">
          No hay suscriptores en esta categoría.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-sans text-xs text-muted-foreground uppercase tracking-wider">Nombre</th>
                <th className="text-left py-2 px-3 font-sans text-xs text-muted-foreground uppercase tracking-wider">Correo</th>
                <th className="text-left py-2 px-3 font-sans text-xs text-muted-foreground uppercase tracking-wider hidden md:table-cell">Género</th>
                <th className="text-left py-2 px-3 font-sans text-xs text-muted-foreground uppercase tracking-wider hidden md:table-cell">Fecha</th>
                <th className="text-left py-2 px-3 font-sans text-xs text-muted-foreground uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-3 font-serif text-foreground">
                    {s.first_name} {s.last_name}
                  </td>
                  <td className="py-2.5 px-3 font-serif text-muted-foreground text-xs">{s.email}</td>
                  <td className="py-2.5 px-3 font-serif text-muted-foreground text-xs hidden md:table-cell capitalize">
                    {s.gender || "—"}
                  </td>
                  <td className="py-2.5 px-3 font-serif text-muted-foreground text-xs hidden md:table-cell">
                    {new Date(s.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs rounded-full font-sans ${
                        s.subscribed
                          ? "bg-green-100 text-green-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s.subscribed ? "Activo" : "Baja"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
