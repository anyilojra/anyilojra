"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ProductCard } from "@/components/product-card"
import { useCart } from "@/lib/cart-context"
import { getProductById, getProductsByCategory } from "@/lib/products"
import { getProductFromDB, getRelatedProductsFromDB, seedProducts } from "@/app/actions/products"
import { ChevronLeft, Minus, Plus, Heart, Share2, Check, Loader2 } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  category: "Mujer" | "Hombre"
  image: string
  images?: string[]
  description: string
  sizes: string[]
  colors: string[]
}

export function ProductDetailClient() {
  const params = useParams()
  const productId = params.id as string
  const { addItem } = useCart()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [addedToCart, setAddedToCart] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    async function loadProduct() {
      try {
        // Seed products if needed
        await seedProducts()
        
        // Try to get from Neon first
        const dbProduct = await getProductFromDB(productId)
        
        let product = dbProduct
        let related: any[] = []
        
        if (product) {
          // Get related products from DB
          related = await getRelatedProductsFromDB(product.category, productId)
        } else {
          // Fallback to static products
          const staticProduct = getProductById(productId)
          if (staticProduct) {
            product = staticProduct
            related = getProductsByCategory(staticProduct.category)
              .filter(p => p.id !== productId)
              .slice(0, 4)
          }
        }
        
        setProduct(product || null)
        
        if (product) {
          if (!product.sizes || product.sizes.length === 0) {
            setSelectedSize("Única")
          } else {
            setSelectedSize(product.sizes[0])
          }
          
          if (!product.colors || product.colors.length === 0) {
            setSelectedColor("Único")
          } else {
            setSelectedColor(product.colors[0])
          }
        }
        
        setRelatedProducts(related)
      } catch (error) {
        console.error('Error loading product:', error)
        // Fallback to static products
        const staticProduct = getProductById(productId)
        if (staticProduct) {
          setProduct(staticProduct)
          setSelectedSize(staticProduct.sizes?.[0] || "Única")
          setSelectedColor(staticProduct.colors?.[0] || "Único")
          const related = getProductsByCategory(staticProduct.category)
            .filter(p => p.id !== productId)
            .slice(0, 4)
          setRelatedProducts(related)
        }
      } finally {
        setLoading(false)
      }
    }
    
    loadProduct()
  }, [productId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-sans text-2xl font-bold text-foreground mb-4">
            Producto no encontrado
          </h1>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:underline font-serif"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  const hasSizes = product.sizes && product.sizes.length > 0
  const hasColors = product.colors && product.colors.length > 0

  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(product.price)

  const canAddToCart = selectedSize !== null && selectedColor !== null

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center gap-2 text-sm font-serif text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <Link 
            href={`/${product.category.toLowerCase()}`} 
            className="hover:text-primary transition-colors"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="flex flex-col gap-4">
            <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              <span className={`absolute top-4 left-4 px-4 py-2 text-sm font-serif uppercase tracking-wider rounded-sm ${
                product.category === "Mujer" 
                  ? "bg-accent text-accent-foreground" 
                  : "bg-foreground text-background"
              }`}>
                {product.category}
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-4 text-primary mb-4">
              <span className="text-lg">⛰</span>
              <div className="w-12 h-px bg-primary" />
            </div>

            <h1 className="font-sans text-3xl md:text-4xl font-bold text-foreground mb-4">
              {product.name}
            </h1>

            <p className="font-sans text-2xl md:text-3xl text-primary font-semibold mb-2">
              {formattedPrice}
            </p>

            <span className="text-sm font-serif text-green-600 mb-6">
              Disponible
            </span>

            <p className="font-serif text-muted-foreground mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Talla — solo si el producto tiene tallas */}
            {hasSizes && (
              <div className="mb-6">
                <h3 className="font-sans text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                  Talla
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[48px] px-4 py-2 text-sm font-serif border rounded-sm transition-colors ${
                        selectedSize === size
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-foreground hover:border-primary"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color — solo si el producto tiene colores */}
            {hasColors && (
              <div className="mb-8">
                <h3 className="font-sans text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                  Color
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 text-sm font-serif border rounded-sm transition-colors ${
                        selectedColor === color
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-foreground hover:border-primary"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8">
              <h3 className="font-sans text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                Cantidad
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-foreground hover:text-primary transition-colors"
                    aria-label="Reducir cantidad"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-serif text-foreground">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 text-foreground hover:text-primary transition-colors"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button 
                onClick={() => {
                  if (canAddToCart && product) {
                    addItem(product, quantity, selectedSize!, selectedColor!)
                    setAddedToCart(true)
                    setTimeout(() => setAddedToCart(false), 2000)
                  }
                }}
                disabled={!canAddToCart}
                className={`flex-1 px-8 py-4 font-serif text-sm uppercase tracking-wider transition-colors rounded-sm flex items-center justify-center gap-2 ${
                  addedToCart 
                    ? "bg-green-600 text-white" 
                    : !canAddToCart
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-4 h-4" />
                    Agregado al carrito
                  </>
                ) : (
                  "Agregar al carrito"
                )}
              </button>
              <button className="p-4 border border-border text-foreground hover:border-primary hover:text-primary transition-colors rounded-sm" aria-label="Agregar a favoritos">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-4 border border-border text-foreground hover:border-primary hover:text-primary transition-colors rounded-sm" aria-label="Compartir">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            <Link 
              href={`/${product.category.toLowerCase()}`}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-serif"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver a {product.category}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Productos relacionados ───────────────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="border-t border-border pt-16">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-primary text-2xl">⛰</span>
              </div>
              <h2 className="font-sans text-2xl md:text-3xl font-bold text-foreground">
                También te puede gustar
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard 
                  key={p.id} 
                  id={p.id}
                  name={p.name}
                  price={p.price}
                  category={p.category}
                  image={p.image}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
