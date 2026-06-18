"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { useCart } from "@/lib/cart-context"
import { ChevronLeft, ChevronRight, Check, MapPin, User, CreditCard, FileDown } from "lucide-react"
import { serverCreateOrder, serverDecreaseProductStock } from "@/app/actions/db"
type Step = "info" | "shipping" | "payment"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const [currentStep, setCurrentStep] = useState<Step>("info")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [orderShortId, setOrderShortId] = useState<string | null>(null)
  const [codeCopied, setCodeCopied] = useState(false)
  const [orderItemsSnapshot, setOrderItemsSnapshot] = useState<typeof items>([])
  const [orderTotalSnapshot, setOrderTotalSnapshot] = useState(0)
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "Bucaramanga",
    departamento: "Santander",
    codigoPostal: "",
    notas: "",
    nequiPhone: "",
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const shippingCost = totalPrice > 200000 ? 0 : 15000
  const finalTotal = totalPrice + shippingCost

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleNextStep = () => {
    if (currentStep === "info") setCurrentStep("shipping")
    else if (currentStep === "shipping") setCurrentStep("payment")
  }

  const handlePrevStep = () => {
    if (currentStep === "payment") setCurrentStep("shipping")
    else if (currentStep === "shipping") setCurrentStep("info")
  }
  const handlePayment = async () => {
    setIsProcessing(true)
    
    try {
      // Validación básica
      if (!formData.nombre || !formData.apellido || !formData.email || !formData.telefono || !formData.nequiPhone) {
        setIsProcessing(false)
        alert('Por favor completa todos los campos requeridos')
        return
      }

      const orderItems = items.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.product.price,
        product_image: item.product.image
      }))

      // Generar un ID de pedido único
      const shortId = Math.random().toString(36).substring(2, 8).toUpperCase()
      
      // Crear la orden en Neon
      const { order, error } = await serverCreateOrder(
        {
          short_id: shortId,
          customer_name: `${formData.nombre} ${formData.apellido}`,
          customer_email: formData.email,
          customer_phone: formData.telefono,
          shipping_address: formData.direccion,
          shipping_city: formData.ciudad,
          shipping_department: formData.departamento,
          payment_method: 'nequi',
          payment_phone: formData.nequiPhone,
          total: finalTotal,
        },
        orderItems
      )

      if (error || !order) {
        throw new Error(error || 'No se pudo crear la orden')
      }

      // Disminuir stock de productos
      for (const item of items) {
        await serverDecreaseProductStock(item.product.id, item.quantity)
      }

      // Guardar snapshot antes de limpiar el carrito
      setOrderItemsSnapshot([...items])
      setOrderTotalSnapshot(finalTotal)
      
      setIsProcessing(false)
      setPaymentComplete(true)
      setOrderShortId(shortId)
      localStorage.setItem("nevada_last_order_short_id", shortId)
      clearCart()

      // Intentar enviar email (no crítico)
      try {
        await fetch("/api/send-order-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order: {
              short_id: shortId,
              customer_name: `${formData.nombre} ${formData.apellido}`,
              customer_email: formData.email,
              customer_phone: formData.telefono,
              total: finalTotal,
            },
            items: orderItems,
            event: "order_created",
          }),
        })
      } catch (emailError) {
        console.log('[v0] Email no se pudo enviar pero pedido completado')
      }
      
    } catch (error) {
      console.error('[v0] Error al procesar el pedido:', error)
      setIsProcessing(false)
      alert('Hubo un error al procesar tu pedido. Por favor intenta de nuevo.')
    }
  }

  const handleDownloadPDF = async () => {
    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF({ unit: "pt", format: "a4" })

    const gold     = [193, 149, 42]  as [number, number, number]
    const goldDark = [150, 112, 20]  as [number, number, number]
    const dark     = [26,  10,  0]   as [number, number, number]
    const muted    = [100, 85,  65]  as [number, number, number]
    const light    = [249, 244, 235] as [number, number, number]
    const white    = [255, 255, 255] as [number, number, number]
    const pageW    = doc.internal.pageSize.getWidth()   // 595.28
    const pageH    = doc.internal.pageSize.getHeight()  // 841.89
    const margin   = 40

    // ── FONDO GENERAL ──────────────────────────────────────────────
    doc.setFillColor(...light)
    doc.rect(0, 0, pageW, pageH, "F")

    // ── CABECERA ───────────────────────────────────────────────────
    // Franja dorada superior
    doc.setFillColor(...gold)
    doc.rect(0, 0, pageW, 110, "F")

    // Acento izquierdo oscuro
    doc.setFillColor(...goldDark)
    doc.rect(0, 0, 6, 110, "F")

    // Logo desde public/logo.svg → convertir a imagen embebida vía fetch
    try {
      const res  = await fetch("/logo.svg")
      const blob = await res.blob()
      const b64  = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve((reader.result as string).split(",")[1])
        reader.readAsDataURL(blob)
      })
      doc.addImage(`data:image/svg+xml;base64,${b64}`, "SVG", 16, 8, 90, 90)
    } catch {
      // Si falla el logo, sólo mostramos texto
    }

    // Nombre empresa
    doc.setFont("helvetica", "bold")
    doc.setFontSize(26)
    doc.setTextColor(...white)
    doc.text("NEVADA", 120, 48)

    // Tagline
    doc.setFont("helvetica", "italic")
    doc.setFontSize(9.5)
    doc.setTextColor(255, 240, 190)
    doc.text("Chaquetas y Ovejeras", 121, 65)

    // Datos empresa (derecha del header)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(255, 245, 210)
    doc.text("ventas@nevada.com", pageW - margin, 30, { align: "right" })
    doc.text("+57 319 504 8344", pageW - margin, 44, { align: "right" })
    doc.text("Bucaramanga, Santander — Colombia", pageW - margin, 58, { align: "right" })

    // Badge "FACTURA"
    doc.setFillColor(...goldDark)
    doc.roundedRect(pageW - margin - 110, 70, 112, 28, 4, 4, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.setTextColor(...white)
    doc.text("FACTURA DE COMPRA", pageW - margin - 54, 88, { align: "center" })

    // ── BLOQUE NÚMERO / FECHA ──────────────────────────────────────
    let y = 128

    doc.setFillColor(...white)
    doc.roundedRect(margin, y, pageW - margin * 2, 36, 5, 5, "F")
    doc.setDrawColor(...gold)
    doc.setLineWidth(1)
    doc.roundedRect(margin, y, pageW - margin * 2, 36, 5, 5, "S")

    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.setTextColor(...gold)
    doc.text("N° PEDIDO", margin + 14, y + 14)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...dark)
    doc.text(orderShortId ?? "—", margin + 14, y + 27)

    doc.setFont("helvetica", "bold")
    doc.setTextColor(...gold)
    doc.text("FECHA DE EMISIÓN", pageW / 2 - 60, y + 14)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...dark)
    doc.text(new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" }), pageW / 2 - 60, y + 27)

    doc.setFont("helvetica", "bold")
    doc.setTextColor(...gold)
    doc.text("ESTADO", pageW - margin - 100, y + 14)
    doc.setFillColor(255, 243, 205)
    doc.roundedRect(pageW - margin - 100, y + 18, 62, 14, 3, 3, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(7.5)
    doc.setTextColor(160, 100, 0)
    doc.text("PENDIENTE", pageW - margin - 69, y + 28, { align: "center" })

    // Separador vertical
    doc.setDrawColor(...gold)
    doc.setLineWidth(0.5)
    doc.line(pageW / 2 - 75, y + 6, pageW / 2 - 75, y + 30)
    doc.line(pageW - margin - 114, y + 6, pageW - margin - 114, y + 30)

    y += 52

    // ── BLOQUE CLIENTE / ENVÍO ─────────────────────────────────────
    const colW = (pageW - margin * 2 - 12) / 2

    // Cliente
    doc.setFillColor(...white)
    doc.roundedRect(margin, y, colW, 100, 5, 5, "F")
    doc.setDrawColor(...gold)
    doc.setLineWidth(0.8)
    doc.roundedRect(margin, y, colW, 100, 5, 5, "S")

    // Franja título cliente
    doc.setFillColor(...gold)
    doc.roundedRect(margin, y, colW, 22, 5, 5, "F")
    doc.rect(margin, y + 12, colW, 10, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8)
    doc.setTextColor(...white)
    doc.text("👤  DATOS DEL CLIENTE", margin + 10, y + 15)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.setTextColor(...dark)
    doc.text(`${formData.nombre} ${formData.apellido}`, margin + 10, y + 38)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8.5)
    doc.setTextColor(...muted)
    doc.text(formData.email, margin + 10, y + 53)
    doc.text(formData.telefono, margin + 10, y + 67)

    // Envío
    const col2X = margin + colW + 12
    doc.setFillColor(...white)
    doc.roundedRect(col2X, y, colW, 100, 5, 5, "F")
    doc.setDrawColor(...gold)
    doc.roundedRect(col2X, y, colW, 100, 5, 5, "S")

    doc.setFillColor(...gold)
    doc.roundedRect(col2X, y, colW, 22, 5, 5, "F")
    doc.rect(col2X, y + 12, colW, 10, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8)
    doc.setTextColor(...white)
    doc.text("📦  DIRECCIÓN DE ENVÍO", col2X + 10, y + 15)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(8.5)
    doc.setTextColor(...dark)
    doc.text(formData.direccion, col2X + 10, y + 38)
    doc.text(`${formData.ciudad}, ${formData.departamento}`, col2X + 10, y + 53)
    doc.text("Colombia", col2X + 10, y + 67)

    y += 116

    // ── TABLA DE PRODUCTOS ─────────────────────────────────────────
    // Encabezado tabla
    doc.setFillColor(...dark)
    doc.roundedRect(margin, y, pageW - margin * 2, 26, 4, 4, "F")
    doc.rect(margin, y + 14, pageW - margin * 2, 12, "F")

    doc.setFont("helvetica", "bold")
    doc.setFontSize(8)
    doc.setTextColor(...white)
    doc.text("PRODUCTO", margin + 12, y + 17)
    doc.text("TALLA", 310, y + 17)
    doc.text("COLOR", 360, y + 17)
    doc.text("CANT.", 418, y + 17, { align: "center" })
    doc.text("P. UNIT.", 476, y + 17, { align: "right" })
    doc.text("SUBTOTAL", pageW - margin - 8, y + 17, { align: "right" })

    y += 26

    // Filas
    orderItemsSnapshot.forEach((item, i) => {
      const rowH = 28
      doc.setFillColor(i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 252 : 247, i % 2 === 0 ? 245 : 238)
      doc.rect(margin, y, pageW - margin * 2, rowH, "F")

      // Línea separadora filas
      doc.setDrawColor(220, 210, 195)
      doc.setLineWidth(0.3)
      doc.line(margin, y + rowH, pageW - margin, y + rowH)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(8.5)
      doc.setTextColor(...dark)
      const name = item.product.name.length > 38 ? item.product.name.substring(0, 36) + "…" : item.product.name
      doc.text(name, margin + 12, y + 18)

      doc.setTextColor(...muted)
      doc.text(item.size ?? "—", 310, y + 18)
      doc.text(item.color ?? "—", 360, y + 18)
      doc.setTextColor(...dark)
      doc.text(String(item.quantity), 418, y + 18, { align: "center" })
      doc.text(formatPrice(item.product.price), 476, y + 18, { align: "right" })

      doc.setFont("helvetica", "bold")
      doc.setTextColor(...goldDark)
      doc.text(formatPrice(item.product.price * item.quantity), pageW - margin - 8, y + 18, { align: "right" })

      y += rowH
    })

    // Borde inferior tabla
    doc.setDrawColor(...gold)
    doc.setLineWidth(1.2)
    doc.line(margin, y, pageW - margin, y)
    y += 18

    // ── TOTALES ────────────────────────────────────────────────────
    const totW  = 200
    const totX  = pageW - margin - totW

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(...muted)
    doc.text("Subtotal productos:", totX, y)
    doc.text(formatPrice(orderTotalSnapshot - shippingCost), pageW - margin - 8, y, { align: "right" })
    y += 18

    doc.text("Costo de envío:", totX, y)
    doc.text(shippingCost === 0 ? "GRATIS" : formatPrice(shippingCost), pageW - margin - 8, y, { align: "right" })
    y += 14

    doc.setDrawColor(...gold)
    doc.setLineWidth(0.6)
    doc.line(totX, y, pageW - margin, y)
    y += 12

    // Caja total
    doc.setFillColor(...gold)
    doc.roundedRect(totX - 8, y - 2, totW + 16, 30, 5, 5, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.setTextColor(...white)
    doc.text("TOTAL A PAGAR:", totX, y + 19)
    doc.text(formatPrice(orderTotalSnapshot), pageW - margin - 8, y + 19, { align: "right" })

    y += 46

    // ── MÉTODO DE PAGO ────────���────────────────────────────────────
    doc.setFillColor(255, 235, 248)
    doc.roundedRect(margin, y, pageW - margin * 2, 46, 5, 5, "F")
    doc.setDrawColor(220, 100, 170)
    doc.setLineWidth(0.6)
    doc.roundedRect(margin, y, pageW - margin * 2, 46, 5, 5, "S")

    doc.setFont("helvetica", "bold")
    doc.setFontSize(8.5)
    doc.setTextColor(170, 30, 110)
    doc.text("💳  MÉTODO DE PAGO: NEQUI", margin + 14, y + 16)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8.5)
    doc.setTextColor(100, 40, 80)
    doc.text(`Número Nequi registrado: +57 ${formData.nequiPhone}`, margin + 14, y + 30)
    doc.text("Estado: Pendiente de confirmación por parte de Nevada", margin + 14, y + 43)

    y += 62

    // ── NOTA INFORMATIVA ───────────────────────────────────────────
    doc.setFillColor(235, 245, 255)
    doc.roundedRect(margin, y, pageW - margin * 2, 32, 4, 4, "F")
    doc.setFont("helvetica", "italic")
    doc.setFontSize(7.8)
    doc.setTextColor(60, 80, 130)
    doc.text(
      "ℹ️  Una vez confirmemos tu pago te notificaremos por WhatsApp/SMS. Guarda tu código de pedido para hacer seguimiento en nuestro sitio web.",
      margin + 10, y + 14,
      { maxWidth: pageW - margin * 2 - 20 }
    )

    // ── FOOTER ─────────────────────────────────────────────────────
    const footerY = pageH - 48
    doc.setFillColor(...dark)
    doc.rect(0, footerY, pageW, 48, "F")
    doc.setFillColor(...gold)
    doc.rect(0, footerY, pageW, 3, "F")

    doc.setFont("helvetica", "normal")
    doc.setFontSize(7.5)
    doc.setTextColor(200, 185, 155)
    doc.text("ventas@nevada.com  ·  +57 319 504 8344  ·  Bucaramanga, Colombia", pageW / 2, footerY + 18, { align: "center" })
    doc.setFont("helvetica", "italic")
    doc.setTextColor(...gold)
    doc.text("✦  Nevada — Chaquetas y Ovejeras  ✦", pageW / 2, footerY + 34, { align: "center" })

    doc.save(`Nevada-Factura-${orderShortId || "pedido"}.pdf`)
  }

  const steps = [
    { id: "info", label: "Información", icon: User },
    { id: "shipping", label: "Envío", icon: MapPin },
    { id: "payment", label: "Pago", icon: CreditCard },
  ]

  const isStepComplete = (step: Step) => {
    const stepOrder = ["info", "shipping", "payment"]
    return stepOrder.indexOf(step) < stepOrder.indexOf(currentStep)
  }

  if (items.length === 0 && !paymentComplete) {
    return (
      <main>
        <Navbar />
        <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-sans text-2xl font-bold text-foreground mb-4">
              Tu carrito está vacío
            </h1>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-primary hover:underline font-serif"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver a la tienda
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (paymentComplete) {
    return (
      <main>
        <Navbar />
        <div className="min-h-screen bg-background pt-20 flex items-center justify-center px-4">
          <div className="text-center max-w-md w-full">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="font-sans text-2xl md:text-3xl font-bold text-foreground mb-2">
              ¡Pedido Registrado!
            </h1>
            <p className="font-serif text-muted-foreground mb-6">
              Cuando confirmemos tu pago de Nequi te avisaremos por SMS al{" "}
              <span className="text-primary">{formData.telefono}</span>
            </p>

            {/* Short ID Card */}
            {orderShortId && (
              <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-5 mb-6">
                <p className="text-xs font-serif text-muted-foreground uppercase tracking-wider mb-2">
                  Tu código de seguimiento
                </p>
                <p className="font-sans text-4xl font-bold text-primary tracking-widest mb-3">
                  {orderShortId}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(orderShortId)
                    setCodeCopied(true)
                    setTimeout(() => setCodeCopied(false), 2000)
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-primary/30 rounded-sm text-sm font-serif text-primary hover:bg-primary/10 transition-colors"
                >
                  {codeCopied ? (
                    <><Check className="w-4 h-4" /> ¡Código copiado!</>
                  ) : (
                    <><span>📋</span> Copiar código</>
                  )}
                </button>
                <p className="text-xs font-serif text-muted-foreground mt-3">
                  Guarda este código para rastrear tu pedido en cualquier momento.
                </p>
              </div>
            )}

            <div className="bg-card border border-border rounded-lg p-4 mb-6 text-left">
              <p className="font-sans text-sm font-semibold text-foreground mb-2">Dirección de envío:</p>
              <p className="font-serif text-sm text-muted-foreground">
                {formData.nombre} {formData.apellido}<br />
                {formData.direccion}<br />
                {formData.ciudad}, {formData.departamento}<br />
                Colombia
              </p>
            </div>

            {/* PDF Download Button */}
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary font-serif text-sm uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors rounded-sm mb-4 w-full justify-center"
            >
              <FileDown className="w-4 h-4" />
              Descargar Factura PDF
            </button>

            <Link
              href={orderShortId ? `/seguimiento?codigo=${orderShortId}` : "/seguimiento"}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-serif text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors rounded-sm mb-4 w-full justify-center"
            >
              Seguir mi pedido
            </Link>

            <Link href="/" className="block font-serif text-sm text-muted-foreground hover:text-foreground transition-colors">
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main>
      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-primary text-xl">✦</span>
            <div className="w-8 h-px bg-primary" />
          </div>
          <h1 className="font-sans text-3xl md:text-4xl font-bold text-foreground mb-8">
            Checkout
          </h1>

          <div className="flex items-center justify-center mb-12">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    currentStep === step.id 
                      ? "bg-primary border-primary text-primary-foreground" 
                      : isStepComplete(step.id as Step)
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-border text-muted-foreground"
                  }`}>
                    {isStepComplete(step.id as Step) ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-xs font-serif mt-2 ${
                    currentStep === step.id ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 md:w-24 h-0.5 mx-2 ${
                    isStepComplete(steps[index + 1].id as Step) || currentStep === steps[index + 1].id
                      ? "bg-primary"
                      : "bg-border"
                  }`} />
                )}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {currentStep === "info" && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="font-sans text-lg font-semibold text-foreground mb-6">
                    Información Personal
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-serif text-sm text-foreground mb-2">Nombre *</label>
                      <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-border rounded-sm bg-background text-foreground font-serif focus:outline-none focus:border-primary transition-colors"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <label className="block font-serif text-sm text-foreground mb-2">Apellido *</label>
                      <input
                        type="text"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-border rounded-sm bg-background text-foreground font-serif focus:outline-none focus:border-primary transition-colors"
                        placeholder="Tu apellido"
                      />
                    </div>
                    <div>
                      <label className="block font-serif text-sm text-foreground mb-2">Correo Electrónico *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-border rounded-sm bg-background text-foreground font-serif focus:outline-none focus:border-primary transition-colors"
                        placeholder="tu@email.com"
                      />
                    </div>
                    <div>
                      <label className="block font-serif text-sm text-foreground mb-2">Teléfono *</label>
                      <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-border rounded-sm bg-background text-foreground font-serif focus:outline-none focus:border-primary transition-colors"
                        placeholder="+57 319 504 8344"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-8">
                    <Link
                      href="/carrito"
                      className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground font-serif text-sm hover:border-primary transition-colors rounded-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Volver al Carrito
                    </Link>
                    <button
                      onClick={handleNextStep}
                      disabled={!formData.nombre || !formData.apellido || !formData.email || !formData.telefono}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-serif text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continuar
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {currentStep === "shipping" && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="font-sans text-lg font-semibold text-foreground mb-6">
                    Dirección de Envío
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block font-serif text-sm text-foreground mb-2">Dirección *</label>
                      <input
                        type="text"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-border rounded-sm bg-background text-foreground font-serif focus:outline-none focus:border-primary transition-colors"
                        placeholder="Calle, número, apartamento"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-serif text-sm text-foreground mb-2">Ciudad *</label>
                        <input
                          type="text"
                          name="ciudad"
                          value={formData.ciudad}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-border rounded-sm bg-background text-foreground font-serif focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block font-serif text-sm text-foreground mb-2">Departamento *</label>
                        <select
                          name="departamento"
                          value={formData.departamento}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-border rounded-sm bg-background text-foreground font-serif focus:outline-none focus:border-primary transition-colors"
                        >
                          <option value="Santander">Santander</option>
                          <option value="Cundinamarca">Cundinamarca</option>
                          <option value="Antioquia">Antioquia</option>
                          <option value="Valle del Cauca">Valle del Cauca</option>
                          <option value="Atlántico">Atlántico</option>
                          <option value="Bolívar">Bolívar</option>
                          <option value="Norte de Santander">Norte de Santander</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block font-serif text-sm text-foreground mb-2">Código Postal</label>
                      <input
                        type="text"
                        name="codigoPostal"
                        value={formData.codigoPostal}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-border rounded-sm bg-background text-foreground font-serif focus:outline-none focus:border-primary transition-colors"
                        placeholder="680001"
                      />
                    </div>
                    <div>
                      <label className="block font-serif text-sm text-foreground mb-2">Notas adicionales</label>
                      <textarea
                        name="notas"
                        value={formData.notas}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-border rounded-sm bg-background text-foreground font-serif focus:outline-none focus:border-primary transition-colors resize-none"
                        placeholder="Instrucciones especiales de entrega..."
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-8">
                    <button
                      onClick={handlePrevStep}
                      className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground font-serif text-sm hover:border-primary transition-colors rounded-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </button>
                    <button
                      onClick={handleNextStep}
                      disabled={!formData.direccion || !formData.ciudad}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-serif text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continuar
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {currentStep === "payment" && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="font-sans text-lg font-semibold text-foreground mb-6">
                    Método de Pago
                  </h2>
                  
                  <div className="border-2 border-primary rounded-lg p-6 mb-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-[#E6007E] rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-xl">N</span>
                      </div>
                      <div>
                        <h3 className="font-sans font-semibold text-foreground text-lg">Nequi</h3>
                        <p className="font-serif text-sm text-muted-foreground">Paga con tu billetera digital</p>
                      </div>
                      <div className="ml-auto">
                        <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-primary" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 mb-6">
                      <p className="font-serif text-sm text-foreground mb-4">
                        Para completar tu pago con Nequi:
                      </p>
                      <ol className="list-decimal list-inside space-y-2 font-serif text-sm text-muted-foreground">
                        <li>Abre tu app Nequi</li>
                        <li>Selecciona &quot;Enviar dinero&quot;</li>
                        <li>Envía <strong className="text-primary">{formatPrice(finalTotal)}</strong> al número:</li>
                      </ol>
                      <div className="mt-4 p-4 bg-[#E6007E]/10 rounded-lg text-center">
                        <p className="font-sans text-2xl font-bold text-[#E6007E]">319 504 8344</p>
                        <p className="font-serif text-xs text-muted-foreground mt-1">Nevada - Vidal Morales</p>
                      </div>
                      <p className="font-serif text-xs text-muted-foreground mt-4">
                        Una vez realizado el pago, haz clic en &quot;Confirmar Pago&quot; para procesar tu pedido.
                      </p>
                    </div>

                    <div>
                      <label className="block font-serif text-sm text-foreground mb-2">
                        Tu número de celular (para confirmar pago) *
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-4 py-3 border border-r-0 border-border rounded-l-sm bg-muted text-muted-foreground font-serif text-sm">
                          +57
                        </span>
                        <input
                          type="tel"
                          name="nequiPhone"
                          value={formData.nequiPhone}
                          onChange={handleInputChange}
                          required
                          maxLength={10}
                          className="flex-1 px-4 py-3 border border-border rounded-r-sm bg-background text-foreground font-serif focus:outline-none focus:border-primary transition-colors"
                          placeholder="Tu número de celular"
                        />
                      </div>
                      <p className="font-serif text-xs text-muted-foreground mt-2">
                        Ingresa el número desde donde realizaste el pago Nequi
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <div>
                      <p className="font-sans text-sm font-semibold text-green-800">Pago 100% Seguro</p>
                      <p className="font-serif text-xs text-green-700">
                        Tus datos están protegidos con encriptación de extremo a extremo
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={handlePrevStep}
                      className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground font-serif text-sm hover:border-primary transition-colors rounded-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </button>
                    <button
                      onClick={handlePayment}
                      disabled={!formData.nequiPhone || formData.nequiPhone.length < 10 || isProcessing}
                      className="inline-flex items-center gap-2 px-8 py-3 bg-[#E6007E] text-white font-serif text-sm uppercase tracking-wider hover:bg-[#C4006B] transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Procesando...
                        </>
                      ) : (
                        <>Confirmar Pago</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
                <h2 className="font-sans text-lg font-semibold text-foreground mb-6">
                  Tu Pedido
                </h2>
                
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div 
                      key={`${item.product.id}-${item.size}-${item.color}`}
                      className="flex gap-3"
                    >
                      <div className="relative w-16 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm font-medium text-foreground line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="font-serif text-xs text-muted-foreground">
                          {item.size} / {item.color}
                        </p>
                        <p className="font-sans text-sm text-primary font-semibold mt-1">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-3">
  <div className="flex justify-between font-serif text-sm text-muted-foreground">
    <span>Subtotal</span>
    <span>{formatPrice(totalPrice)}</span>
  </div>
  <div className="flex justify-between font-serif text-sm text-muted-foreground">
    <span>Envío</span>
    <span>{shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}</span>
  </div>

  <div className="border-t border-border pt-3 flex justify-between font-sans font-semibold text-foreground">
    <span>Total</span>
    <span className="text-primary text-lg">{formatPrice(finalTotal)}</span>
  </div>
</div>

                {currentStep !== "info" && formData.nombre && (
                  <div className="border-t border-border mt-6 pt-4">
                    <p className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Enviar a
                    </p>
                    <p className="font-serif text-sm text-foreground">
                      {formData.nombre} {formData.apellido}
                    </p>
                    {formData.direccion && (
                      <p className="font-serif text-sm text-muted-foreground">
                        {formData.direccion}, {formData.ciudad}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
