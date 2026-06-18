"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  LogOut,
  Scan,
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Barcode,
  CreditCard,
  Banknote,
  Smartphone,
  AlertTriangle,
} from "lucide-react"

// ─── types ──────────────────────────────────────────────────────────────────
type Product = {
  id: string
  name: string
  price: number
  stock: number
  category: string
  image: string
  sizes?: string[]
  colors?: string[]
  barcode?: string
}

type PosCartItem = {
  product: Product
  quantity: number
  size: string
  color: string
}

// ─── helpers ────────────────────────────────────────────────────────────────

function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value)
}

// ─── component ───────────────────────────────────────────────────────────────

export default function VentaTiendaPage() {
  const router = useRouter()

  // auth
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // catálogo
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  // búsqueda / scanner
  const [searchCode, setSearchCode] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [scanError, setScanError] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const scanInputRef = useRef<HTMLInputElement>(null)

  // selector de variante
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedQty, setSelectedQty] = useState(1)

  // carrito
  const [cart, setCart] = useState<PosCartItem[]>([])

  // pago
  const [paymentMethod, setPaymentMethod] = useState<
    "efectivo" | "transferencia" | "tarjeta"
  >("efectivo")
  const [cashierNote, setCashierNote] = useState("")
  const [processing, setProcessing] = useState(false)
  const [saleResult, setSaleResult] = useState<{
    success: boolean
    short_id?: string
    error?: string
  } | null>(null)

  // tabs UI
  const [activeTab, setActiveTab] = useState<"scanner" | "catalog">("scanner")

  // ── initialization ─────────────────────────────────────────────────────────
  useEffect(() => {
    setIsAuthenticated(true)
    loadProducts()
  }, [])

  async function handleLogout() {
    try {
      await fetch("/api/auth/signout", { method: "POST" })
    } catch (err) {
      console.log('[v0] Logout error')
    }
    router.push("/admin/login")
  }

  // ── catalog ────────────────────────────────────────────────────────────────
  async function loadProducts() {
    setLoadingProducts(true)
    try {
      const response = await fetch("/api/products")
      if (!response.ok) throw new Error("Failed to load products")
      const data = await response.json()
      setAllProducts(data.products || [])
    } catch (err) {
      console.error("[v0] Error loading products:", err)
    }
    setLoadingProducts(false)
  }

  // live catalog filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    const q = searchQuery.toLowerCase()
    setSearchResults(
      allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    )
  }, [searchQuery, allProducts])

  // ── barcode / manual search ───────────────────────────────────────────────
  const handleScan = useCallback(
    async (code: string) => {
      if (!code.trim()) return
      setSearching(true)
      setScanError(null)
      try {
        const product = allProducts.find(p => p.barcode === code.trim() || p.id === code.trim())
        if (product) {
          openVariantSelector(product)
          setSearchCode("")
        } else {
          setScanError(`No se encontró producto con código: "${code.trim()}"`)
        }
      } catch (err) {
        setScanError("Error al buscar producto")
      }
      setSearching(false)
    },
    [allProducts]
  )

  function handleScanKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleScan(searchCode)
    }
  }

  // ── variant selector ───────────────────────────────────────────────────────
  function openVariantSelector(product: Product) {
    setSelectedProduct(product)
    setSelectedSize(product.sizes?.[0] || "Única")
    setSelectedColor(product.colors?.[0] || "Único")
    setSelectedQty(1)
  }

  function closeVariantSelector() {
    setSelectedProduct(null)
  }

  function confirmAddToCart() {
    if (!selectedProduct) return
    if (selectedProduct.stock <= 0) {
      setScanError("Este producto no tiene stock disponible.")
      closeVariantSelector()
      return
    }

    const existing = cart.findIndex(
      (i) =>
        i.product.id === selectedProduct.id &&
        i.size === selectedSize &&
        i.color === selectedColor
    )

    if (existing >= 0) {
      const updated = [...cart]
      updated[existing].quantity += selectedQty
      setCart(updated)
    } else {
      setCart([
        ...cart,
        {
          product: selectedProduct,
          quantity: selectedQty,
          size: selectedSize,
          color: selectedColor,
        },
      ])
    }
    closeVariantSelector()
    setScanError(null)
  }

  // ── cart ops ───────────────────────────────────────────────────���───────────
  function changeQty(index: number, delta: number) {
    const updated = [...cart]
    updated[index].quantity = Math.max(1, updated[index].quantity + delta)
    setCart(updated)
  }

  function removeItem(index: number) {
    setCart(cart.filter((_, i) => i !== index))
  }

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  // ── checkout ───────────────────────────────────────────────────────────────
  async function handleCheckout() {
    if (cart.length === 0) return
    setProcessing(true)
    try {
      const response = await fetch("/api/pos/register-sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          total: cartTotal,
          payment_method: paymentMethod,
          cashier_note: cashierNote,
        })
      })
      
      const result = await response.json()
      setProcessing(false)
      setSaleResult(result)
      if (result.success) {
        setCart([])
        setCashierNote("")
        loadProducts()
      }
    } catch (err) {
      console.error("[v0] Checkout error:", err)
      setSaleResult({ success: false, error: "Error al registrar la venta" })
      setProcessing(false)
    }
  }

  function resetSale() {
    setSaleResult(null)
    setSearchCode("")
    setSearchQuery("")
    setSearchResults([])
    scanInputRef.current?.focus()
  }

  // ── loading / auth guard ───────────────────────────────────────────────────
  // ── success screen ─────────────────────────────────────────────────────────
  if (saleResult?.success) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="font-sans text-2xl font-semibold text-foreground text-center">
          ¡Venta registrada!
        </h2>
        <p className="text-muted-foreground text-center">
          ID de venta:{" "}
          <span className="font-mono font-bold text-primary">
            {saleResult.short_id}
          </span>
        </p>
        <p className="text-muted-foreground text-center">
          El stock del sitio web ya fue actualizado.
        </p>
        <button
          onClick={resetSale}
          className="mt-4 px-8 py-3 bg-primary text-primary-foreground font-sans font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          Nueva venta
        </button>
        <Link
          href="/admin"
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          ← Volver al panel
        </Link>
      </div>
    )
  }

  // ── error screen ───────────────────────────────────────────────────────────
  if (saleResult && !saleResult.success) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="font-sans text-2xl font-semibold text-foreground">
          Error al registrar
        </h2>
        <p className="text-muted-foreground text-center max-w-sm">
          {saleResult.error}
        </p>
        <button
          onClick={() => setSaleResult(null)}
          className="px-8 py-3 bg-primary text-primary-foreground font-sans font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    )
  }

  // ── main UI ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20Project%20-%20Standard%20%281%29-EEagyJk1pnfERasqx8vaeakjDXKfR8.svg"
              alt="Santizzima"
              width={32}
              height={32}
              className="w-7 h-7"
            />
            <span className="font-sans text-lg font-semibold text-foreground hidden sm:inline">
              Venta en Tienda
            </span>
            <span className="font-sans text-lg font-semibold text-foreground sm:hidden">
              POS
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* Main layout — two columns on desktop */}
      <main className="pt-16 max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 min-h-screen">
        {/* ── LEFT: product search ──────────────────────────────────────── */}
        <section>
          {/* Tabs */}
          <div className="flex gap-1 mb-5 bg-muted p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab("scanner")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-sans font-medium transition-colors ${
                activeTab === "scanner"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Barcode className="w-4 h-4" />
              Código / Scanner
            </button>
            <button
              onClick={() => setActiveTab("catalog")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-sans font-medium transition-colors ${
                activeTab === "catalog"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Search className="w-4 h-4" />
              Catálogo
            </button>
          </div>

          {/* ── Scanner tab ── */}
          {activeTab === "scanner" && (
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-sans text-base font-semibold text-foreground mb-1">
                  Escanear o ingresar código
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Usa el lector de código de barras o escribe el código manualmente y presiona{" "}
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Enter</kbd>.
                </p>

                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Scan className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      ref={scanInputRef}
                      type="text"
                      value={searchCode}
                      onChange={(e) => setSearchCode(e.target.value)}
                      onKeyDown={handleScanKeyDown}
                      placeholder="Código de barras o ID del producto…"
                      autoFocus
                      className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono text-base"
                    />
                  </div>
                  <button
                    onClick={() => handleScan(searchCode)}
                    disabled={searching || !searchCode.trim()}
                    className="px-5 py-3 bg-primary text-primary-foreground rounded-lg font-sans font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {searching ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Buscando
                      </span>
                    ) : (
                      "Buscar"
                    )}
                  </button>
                </div>

                {scanError && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {scanError}
                  </div>
                )}
              </div>

              {/* Quick access — all products grid */}
              <div>
                <h3 className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Productos disponibles ({allProducts.filter((p) => p.stock > 0).length})
                </h3>
                {loadingProducts ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="h-32 bg-muted animate-pulse rounded-xl"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {allProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => openVariantSelector(product)}
                        disabled={product.stock <= 0}
                        className={`group relative bg-card border border-border rounded-xl overflow-hidden text-left hover:border-primary hover:shadow-md transition-all ${
                          product.stock <= 0 ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <div className="aspect-square relative bg-muted">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                          {product.stock <= 0 && (
                            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                              <span className="text-xs font-sans font-semibold text-muted-foreground bg-background/80 px-2 py-1 rounded-full">
                                Sin stock
                              </span>
                            </div>
                          )}
                          {product.stock > 0 && product.stock <= 3 && (
                            <div className="absolute top-1 right-1 bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                              {product.stock} left
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="font-sans text-xs font-semibold text-foreground leading-tight truncate">
                            {product.name}
                          </p>
                          <p className="font-sans text-xs text-primary font-medium mt-0.5">
                            {formatCOP(product.price)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Catalog tab ── */}
          {activeTab === "catalog" && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre o categoría…"
                  className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {searchQuery && (
                <div className="space-y-2">
                  {searchResults.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No se encontraron productos para "{searchQuery}"
                    </p>
                  ) : (
                    searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => openVariantSelector(product)}
                        disabled={product.stock <= 0}
                        className={`w-full flex items-center gap-4 bg-card border border-border rounded-xl p-3 text-left hover:border-primary hover:shadow-sm transition-all ${
                          product.stock <= 0
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-sm font-semibold text-foreground truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.category} · Stock: {product.stock}
                          </p>
                        </div>
                        <p className="font-sans text-sm font-semibold text-primary flex-shrink-0">
                          {formatCOP(product.price)}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              )}

              {!searchQuery && (
                <p className="text-sm text-muted-foreground text-center py-12">
                  Escribe para buscar un producto
                </p>
              )}
            </div>
          )}
        </section>

        {/* ── RIGHT: cart + checkout ────────────────────────────────────── */}
        <aside className="lg:sticky lg:top-20 space-y-4 h-fit">
          {/* Cart */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary" />
              <h2 className="font-sans text-sm font-semibold text-foreground">
                Carrito de venta ({cart.length})
              </h2>
            </div>

            {cart.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <ShoppingBag className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Agrega productos escaneando
                  <br />o seleccionando del catálogo
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border max-h-[340px] overflow-y-auto">
                {cart.map((item, idx) => (
                  <div key={idx} className="px-4 py-3 flex items-start gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={item.product.image || "/placeholder.svg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-xs font-semibold text-foreground truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.size} · {item.color}
                      </p>
                      <p className="text-xs text-primary font-medium mt-0.5">
                        {formatCOP(item.product.price * item.quantity)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => changeQty(idx, -1)}
                        className="w-6 h-6 rounded-md bg-muted hover:bg-border flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-sans font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => changeQty(idx, 1)}
                        className="w-6 h-6 rounded-md bg-muted hover:bg-border flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeItem(idx)}
                        className="w-6 h-6 rounded-md hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors ml-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total */}
            {cart.length > 0 && (
              <div className="px-4 py-3 border-t border-border bg-muted/40 flex justify-between items-center">
                <span className="font-sans text-sm text-muted-foreground">Total</span>
                <span className="font-sans text-base font-bold text-foreground">
                  {formatCOP(cartTotal)}
                </span>
              </div>
            )}
          </div>

          {/* Payment method */}
          {cart.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <h3 className="font-sans text-sm font-semibold text-foreground">
                Método de pago
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { value: "efectivo", label: "Efectivo", icon: Banknote },
                    {
                      value: "transferencia",
                      label: "Transfer.",
                      icon: Smartphone,
                    },
                    { value: "tarjeta", label: "Tarjeta", icon: CreditCard },
                  ] as const
                ).map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setPaymentMethod(value)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border text-xs font-sans font-medium transition-colors ${
                      paymentMethod === value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-muted-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={cashierNote}
                onChange={(e) => setCashierNote(e.target.value)}
                placeholder="Nota opcional (ej: cliente frecuente)"
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />

              <button
                onClick={handleCheckout}
                disabled={processing || cart.length === 0}
                className="w-full py-3 bg-primary text-primary-foreground font-sans font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Procesando…
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Confirmar venta · {formatCOP(cartTotal)}
                  </>
                )}
              </button>
            </div>
          )}
        </aside>
      </main>

      {/* ── Variant selector modal ── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
            {/* header */}
            <div className="flex items-center gap-3 p-4 border-b border-border">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                <Image
                  src={selectedProduct.image || "/placeholder.svg"}
                  alt={selectedProduct.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm font-semibold text-foreground truncate">
                  {selectedProduct.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedProduct.category} · Stock: {selectedProduct.stock}
                </p>
                <p className="font-sans text-sm font-semibold text-primary mt-0.5">
                  {formatCOP(selectedProduct.price)}
                </p>
              </div>
              <button
                onClick={closeVariantSelector}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* variants */}
            <div className="p-4 space-y-4">
              {/* sizes */}
              {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                <div>
                  <p className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Talla
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-sans font-medium transition-colors ${
                          selectedSize === size
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-foreground hover:border-primary"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* colors */}
              {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                <div>
                  <p className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Color
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-sans font-medium transition-colors ${
                          selectedColor === color
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-foreground hover:border-primary"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* qty */}
              <div>
                <p className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Cantidad
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                    className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-sans text-base font-semibold w-8 text-center">
                    {selectedQty}
                  </span>
                  <button
                    onClick={() =>
                      setSelectedQty(
                        Math.min(selectedProduct.stock, selectedQty + 1)
                      )
                    }
                    className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={confirmAddToCart}
                className="w-full py-3 bg-primary text-primary-foreground font-sans font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Agregar al carrito · {formatCOP(selectedProduct.price * selectedQty)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
