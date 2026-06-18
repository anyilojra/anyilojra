"use client"

import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useCart } from "@/lib/cart-context"
import { Minus, Plus, Trash2, ShoppingBag, ChevronRight } from "lucide-react"

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart()

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

  return (
    <main>
      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-primary text-xl">✦</span>
            <div className="w-8 h-px bg-primary" />
          </div>
          <h1 className="font-sans text-3xl md:text-4xl font-bold text-foreground">
            Tu Carrito
          </h1>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h2 className="font-sans text-xl font-semibold text-foreground mb-4">
                Tu carrito está vacío
              </h2>
              <p className="font-serif text-muted-foreground mb-8">
                Descubre nuestra colección de moda católica con propósito
              </p>
              <Link
                href="/"
                className="inline-block px-8 py-3 bg-primary text-primary-foreground font-serif text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors rounded-sm"
              >
                Explorar Colección
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.size}-${item.color}`}
                    className="bg-card border border-border rounded-lg p-4 flex gap-4"
                  >
                    <div className="relative w-24 h-32 bg-muted rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <Link 
                            href={`/producto/${item.product.id}`}
                            className="font-sans font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                          >
                            {item.product.name}
                          </Link>
                          <p className="font-serif text-sm text-muted-foreground mt-1">
                            Talla: {item.size} | Color: {item.color}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id, item.size, item.color)}
                          className="p-2 text-muted-foreground hover:text-accent transition-colors"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-border rounded-sm">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                            className="p-2 text-foreground hover:text-primary transition-colors"
                            aria-label="Reducir cantidad"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-serif text-sm text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                            className="p-2 text-foreground hover:text-primary transition-colors"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <p className="font-sans font-semibold text-primary">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
                  <h2 className="font-sans text-lg font-semibold text-foreground mb-6">
                    Resumen del Pedido
                  </h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between font-serif text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between font-serif text-muted-foreground">
                      <span>Envío</span>
                      <span>{shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}</span>
                    </div>
                    {shippingCost > 0 && (
                      <p className="text-xs font-serif text-primary">
                        Envío gratis en compras superiores a {formatPrice(200000)}
                      </p>
                    )}
                    <div className="border-t border-border pt-4 flex justify-between font-sans font-semibold text-foreground">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(finalTotal)}</span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-primary text-primary-foreground font-serif text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors rounded-sm"
                  >
                    Proceder al Pago
                    <ChevronRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/"
                    className="block text-center mt-4 font-serif text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Continuar Comprando
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
