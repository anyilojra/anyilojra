"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Edit2, ChevronLeft, Upload, LogOut, X, Barcode, Printer, RefreshCw } from "lucide-react"
import { BarcodeLabelModal } from "@/components/barcode-label-modal"

// ── type ──────────────────────────────────────────────────────────────────
type Product = {
  id: string
  name: string
  price: number
  stock: number
  category: string
  image: string
  images?: string[]
  description?: string
  sizes?: string[]
  colors?: string[]
  barcode?: string
}

function generateBarcode(): string {
  const digits = Math.floor(Math.random() * 9999999999 + 1)
    .toString()
    .padStart(10, "0")
  return `NVD${digits}`
}

function drawBarcode(canvas: HTMLCanvasElement, code: string) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  const W = canvas.width
  const H = canvas.height
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, W, H)

  const bars: number[] = []
  for (let i = 0; i < code.length; i++) {
    const v = code.charCodeAt(i)
    for (let b = 6; b >= 0; b--) bars.push((v >> b) & 1)
  }
  const full = [1, 0, 1, ...bars, 1, 1, 0, 1, 0, 1]
  const barW = Math.max(1, Math.floor(W / full.length))
  const barH = H - 4
  ctx.fillStyle = "#000000"
  full.forEach((bit, i) => {
    if (bit) ctx.fillRect(i * barW, 2, barW, barH)
  })
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price)

// ── component ─────────────────────────────────────────────────────────────────

export default function AdminProductosPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // barcode / print
  const [printProducts, setPrintProducts] = useState<Product[]>([])
  const [showPrint, setShowPrint] = useState(false)
  const [updatingBarcodes, setUpdatingBarcodes] = useState(false)
  const barcodeCanvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({})

  // form
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("0")
  const [category, setCategory] = useState<"Mujer" | "Hombre" | "Accesorios">("Mujer")
  const [image, setImage] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState("")
  const [description, setDescription] = useState("")
  const [sizes, setSizes] = useState<string[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [newSize, setNewSize] = useState("")
  const [newColor, setNewColor] = useState("")
  const [barcode, setBarcode] = useState("")

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

  async function loadProducts() {
    setLoading(true)
    try {
      const response = await fetch("/api/products")
      if (!response.ok) throw new Error("Failed to load products")
      const data = await response.json()
      setProducts(data.products || [])
    } catch (err) {
      console.error("[v0] Error loading products:", err)
      setMessage({ type: "error", text: "Error al cargar productos." })
    }
    setLoading(false)
  }

  // ── draw mini barcodes on product cards ──────────────────────────────────
  useEffect(() => {
    products.forEach((p) => {
      const canvas = barcodeCanvasRefs.current[p.id]
      if (canvas && p.barcode) drawBarcode(canvas, p.barcode)
    })
  }, [products, loading])

  // ── generate barcodes for products that don't have one ──────────────────
  async function assignMissingBarcodes() {
    const missing = products.filter((p) => !p.barcode)
    if (missing.length === 0) {
      setMessage({ type: "success", text: "Todos los productos ya tienen código de barras." })
      return
    }
    setUpdatingBarcodes(true)
    let updated = 0
    for (const p of missing) {
      const code = generateBarcode()
      try {
        const response = await fetch(`/api/products/${p.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ barcode: code })
        })
        if (response.ok) updated++
      } catch (err) {
        console.error("[v0] Error updating barcode:", err)
      }
    }
    setMessage({ type: "success", text: `${updated} producto(s) actualizados con código de barras.` })
    setUpdatingBarcodes(false)
    loadProducts()
  }

  // ── form helpers ─────────────────────────────────────────────────────────
  function resetForm() {
    setName(""); setPrice(""); setStock("0"); setCategory("Mujer")
    setImage(""); setImages([]); setNewImageUrl(""); setDescription("")
    setSizes([]); setColors([]); setNewSize(""); setNewColor("")
    setBarcode(""); setEditingProduct(null); setShowForm(false)
  }

  function openEditForm(product: Product) {
    setEditingProduct(product)
    setName(product.name)
    setPrice(product.price.toString())
    setStock((product.stock ?? 0).toString())
    setCategory(product.category)
    setImage(product.image)
    setImages(product.images || [product.image])
    setDescription(product.description || "")
    setSizes(product.sizes || [])
    setColors(product.colors || [])
    setBarcode(product.barcode || generateBarcode())
    setShowForm(true)
  }

  function addImageUrl() {
    if (newImageUrl && !images.includes(newImageUrl)) {
      const updated = [...images, newImageUrl]
      setImages(updated)
      if (updated.length === 1) setImage(newImageUrl)
      setNewImageUrl("")
    }
  }

  function removeImage(url: string) {
    const updated = images.filter(img => img !== url)
    setImages(updated)
    if (image === url) setImage(updated[0] || "")
  }

  function addSize() {
    if (newSize && !sizes.includes(newSize)) { setSizes([...sizes, newSize]); setNewSize("") }
  }
  function removeSize(s: string) { setSizes(sizes.filter(x => x !== s)) }
  function addColor() {
    if (newColor && !colors.includes(newColor)) { setColors([...colors, newColor]); setNewColor("") }
  }
  function removeColor(c: string) { setColors(colors.filter(x => x !== c)) }

  // ── submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    const finalBarcode = barcode || generateBarcode()

    const productData = {
      name,
      price: parseInt(price),
      stock: parseInt(stock),
      category,
      image: images.length > 0 ? images[0] : image,
      images: images.length > 0 ? images : [image],
      description,
      sizes,
      colors,
      barcode: finalBarcode,
    }

    try {
      const url = editingProduct 
        ? `/api/products/${editingProduct.id}`
        : "/api/products"
      const method = editingProduct ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData)
      })
      
      if (response.ok) {
        const result = await response.json()
        setMessage({ type: "success", text: editingProduct ? "Producto actualizado exitosamente" : "Producto agregado exitosamente" })
        
        if (editingProduct) {
          setProducts(products.map(p => p.id === editingProduct.id ? result.product : p))
        } else {
          setProducts([result.product, ...products])
        }
        resetForm()
      } else {
        setMessage({ type: "error", text: editingProduct ? "Error al actualizar el producto" : "Error al agregar el producto" })
      }
    } catch (err) {
      console.error("[v0] Error submitting product:", err)
      setMessage({ type: "error", text: "Error de conexión." })
    }
    setSubmitting(false)
  }

  // ── delete ────────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    setDeleting(id); setMessage(null)
    try {
      const response = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (response.ok) {
        setMessage({ type: "success", text: "Producto eliminado exitosamente" })
        setProducts(products.filter(p => p.id !== id))
      } else {
        setMessage({ type: "error", text: "Error al eliminar el producto" })
      }
    } catch (err) {
      console.error("[v0] Error deleting product:", err)
      setMessage({ type: "error", text: "Error de conexión." })
    }
    setDeleting(null); setShowDeleteConfirm(null)
  }

  // ── print helpers ─────────────────────────────────────────────────────────
  function openPrintAll() {
    setPrintProducts(products.filter(p => p.barcode))
    setShowPrint(true)
  }
  function openPrintOne(product: Product) {
    setPrintProducts([product])
    setShowPrint(true)
  }

  // ── guards ────────────────────────────────────────────────────────────────
  const missingBarcodes = products.filter(p => !p.barcode).length

  return (
    <main className="min-h-screen bg-background">
      <div className="pt-8 pb-16 px-4 md:px-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-sans text-2xl md:text-3xl font-bold text-foreground">
              Administrar Productos
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {missingBarcodes > 0 && (
              <button
                onClick={assignMissingBarcodes}
                disabled={updatingBarcodes}
                className="flex items-center gap-2 px-3 py-2 bg-amber-500 text-white font-sans text-sm rounded-sm hover:bg-amber-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${updatingBarcodes ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">
                  {updatingBarcodes ? "Generando..." : `Generar códigos (${missingBarcodes})`}
                </span>
              </button>
            )}
            <button
              onClick={openPrintAll}
              className="flex items-center gap-2 px-3 py-2 border border-border text-foreground font-sans text-sm rounded-sm hover:bg-muted transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir etiquetas</span>
            </button>
            <button
              onClick={() => { resetForm(); setBarcode(generateBarcode()); setShowForm(true) }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-serif text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors rounded-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Agregar Producto</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 border border-border text-foreground font-serif text-sm uppercase tracking-wider hover:bg-muted transition-colors rounded-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-sm ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {message.text}
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="mb-8 p-6 bg-card border border-border rounded-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-sans text-xl font-semibold">
                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
              </h2>
              <button onClick={resetForm} className="p-2 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Nombre del producto *</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required
                    placeholder="Ej: Vestido Santa Clara"
                    className="w-full px-4 py-3 border border-border rounded-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Precio (COP) *</label>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} required
                    placeholder="Ej: 185000"
                    className="w-full px-4 py-3 border border-border rounded-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Cantidad en stock *</label>
                  <input type="number" value={stock} onChange={e => setStock(e.target.value)} required min="0"
                    placeholder="Ej: 10"
                    className="w-full px-4 py-3 border border-border rounded-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Categoría *</label>
                  <select value={category} onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-4 py-3 border border-border rounded-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="Mujer">Mujer</option>
                    <option value="Hombre">Hombre</option>
                    <option value="Accesorios">Accesorios</option>
                  </select>
                </div>
              </div>

              {/* Barcode */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Código de barras
                </label>
                <div className="flex gap-2">
                  <input type="text" value={barcode} onChange={e => setBarcode(e.target.value)}
                    placeholder="Se genera automáticamente"
                    className="flex-1 px-4 py-3 border border-border rounded-sm bg-background text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary" />
                  <button type="button" onClick={() => setBarcode(generateBarcode())}
                    className="px-4 py-3 bg-muted text-foreground rounded-sm hover:bg-muted/80 flex items-center gap-2 text-sm">
                    <RefreshCw className="w-4 h-4" />
                    Regenerar
                  </button>
                </div>
                {barcode && (
                  <div className="mt-3 p-3 bg-white border border-border rounded-sm inline-block">
                    <canvas
                      ref={el => { if (el) { barcodeCanvasRefs.current["form"] = el; drawBarcode(el, barcode) } }}
                      width={200} height={50}
                      style={{ imageRendering: "pixelated" }}
                    />
                    <p className="font-mono text-xs text-center text-muted-foreground mt-1">{barcode}</p>
                  </div>
                )}
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Imágenes del producto *</label>
                <div className="flex gap-2 mb-4">
                  <input type="url" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="flex-1 px-4 py-3 border border-border rounded-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addImageUrl() } }} />
                  <button type="button" onClick={addImageUrl}
                    className="px-4 py-3 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90">Agregar</button>
                </div>
                {images.length > 0 ? (
                  <div className="flex flex-wrap gap-4">
                    {images.map((img, index) => (
                      <div key={index} className="relative group">
                        <div className={`w-24 h-24 relative rounded-sm overflow-hidden border-2 ${img === image ? "border-primary" : "border-border"}`}>
                          <Image src={img} alt={`Imagen ${index + 1}`} fill className="object-cover" />
                        </div>
                        <div className="absolute -top-2 -right-2 flex gap-1">
                          {img !== image && (
                            <button type="button" onClick={() => setImage(img)}
                              className="p-1 bg-blue-500 text-white rounded-full text-xs hover:bg-blue-600" title="Principal">★</button>
                          )}
                          <button type="button" onClick={() => removeImage(img)}
                            className="p-1 bg-red-500 text-white rounded-full text-xs hover:bg-red-600">×</button>
                        </div>
                        {img === image && (
                          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-sm">Principal</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Agrega al menos una imagen</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Descripción</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                  placeholder="Descripción detallada del producto..."
                  className="w-full px-4 py-3 border border-border rounded-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tallas disponibles</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newSize} onChange={e => setNewSize(e.target.value)}
                    placeholder="Ej: S, M, L, XL"
                    className="flex-1 px-4 py-2 border border-border rounded-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSize() } }} />
                  <button type="button" onClick={addSize} className="px-4 py-2 bg-muted text-foreground rounded-sm hover:bg-muted/80">Agregar</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(s => (
                    <span key={s} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-sm text-sm">
                      {s}<button type="button" onClick={() => removeSize(s)} className="hover:text-accent">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Colores disponibles</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newColor} onChange={e => setNewColor(e.target.value)}
                    placeholder="Ej: Blanco, Negro, Azul"
                    className="flex-1 px-4 py-2 border border-border rounded-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addColor() } }} />
                  <button type="button" onClick={addColor} className="px-4 py-2 bg-muted text-foreground rounded-sm hover:bg-muted/80">Agregar</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colors.map(c => (
                    <span key={c} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-sm text-sm">
                      {c}<button type="button" onClick={() => removeColor(c)} className="hover:text-accent">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <button type="submit" disabled={submitting}
                  className="px-6 py-3 bg-primary text-primary-foreground font-serif text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors rounded-sm disabled:opacity-50">
                  {submitting ? "Guardando..." : editingProduct ? "Actualizar Producto" : "Guardar Producto"}
                </button>
                <button type="button" onClick={resetForm}
                  className="px-6 py-3 border border-border text-foreground font-serif text-sm uppercase tracking-wider hover:bg-muted transition-colors rounded-sm">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando productos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-sm">
            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No hay productos todavía</p>
            <button onClick={() => { resetForm(); setBarcode(generateBarcode()); setShowForm(true) }}
              className="px-6 py-3 bg-primary text-primary-foreground font-serif text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors rounded-sm">
              Agregar tu primer producto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-card border border-border rounded-sm overflow-hidden group">
                {/* Image */}
                <div className="relative aspect-square">
                  <Image src={product.image} alt={product.name} fill className="object-cover" />
                  <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-sm ${
                    product.category === "Mujer" ? "bg-accent text-accent-foreground"
                    : product.category === "Hombre" ? "bg-foreground text-background"
                    : "bg-primary text-primary-foreground"
                  }`}>
                    {product.category}
                  </span>
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditForm(product)}
                      className="p-2 bg-white text-foreground rounded-sm hover:bg-primary hover:text-primary-foreground transition-colors shadow-md" title="Editar">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => openPrintOne(product)}
                      className="p-2 bg-white text-foreground rounded-sm hover:bg-primary hover:text-primary-foreground transition-colors shadow-md" title="Imprimir etiqueta">
                      <Printer className="w-4 h-4" />
                    </button>
                    <button onClick={() => setShowDeleteConfirm(product.id)}
                      className="p-2 bg-white text-red-600 rounded-sm hover:bg-red-600 hover:text-white transition-colors shadow-md" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-sans font-semibold text-foreground mb-1">{product.name}</h3>
                  <p className="text-primary font-medium">{formatPrice(product.price)}</p>
                  <p className={`text-sm font-medium mt-1 ${product.stock === 0 ? "text-red-500" : "text-green-600"}`}>
                    Stock: {product.stock ?? 0} unidades
                  </p>
                  {product.sizes && product.sizes.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">Tallas: {product.sizes.join(", ")}</p>
                  )}
                  {product.colors && product.colors.length > 0 && (
                    <p className="text-sm text-muted-foreground">Colores: {product.colors.join(", ")}</p>
                  )}

                  {/* Barcode section */}
                  <div className="mt-3 pt-3 border-t border-border">
                    {product.barcode ? (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <canvas
                            ref={el => { barcodeCanvasRefs.current[product.id] = el }}
                            width={140} height={36}
                            className="w-full"
                            style={{ imageRendering: "pixelated" }}
                          />
                          <p className="font-mono text-[10px] text-muted-foreground truncate mt-0.5">
                            {product.barcode}
                          </p>
                        </div>
                        <button
                          onClick={() => openPrintOne(product)}
                          className="flex-shrink-0 p-2 text-muted-foreground hover:text-primary transition-colors"
                          title="Imprimir etiqueta"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-amber-600">
                        <Barcode className="w-4 h-4 flex-shrink-0" />
                        <span>Sin código de barras</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-card border border-border rounded-sm p-6 max-w-md w-full">
            <h3 className="font-sans text-lg font-semibold text-foreground mb-4">Confirmar eliminación</h3>
            <p className="text-muted-foreground mb-6">¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.</p>
            <div className="flex gap-4">
              <button onClick={() => handleDelete(showDeleteConfirm)} disabled={deleting === showDeleteConfirm}
                className="flex-1 px-4 py-3 bg-red-600 text-white font-serif text-sm uppercase tracking-wider hover:bg-red-700 transition-colors rounded-sm disabled:opacity-50">
                {deleting === showDeleteConfirm ? "Eliminando..." : "Eliminar"}
              </button>
              <button onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-3 border border-border text-foreground font-serif text-sm uppercase tracking-wider hover:bg-muted transition-colors rounded-sm">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print modal */}
      {showPrint && (
        <BarcodeLabelModal
          products={printProducts}
          onClose={() => setShowPrint(false)}
        />
      )}
    </main>
  )
}
