"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CollectionPage } from "@/components/collection-page"
import { getProductsByCategory, type Product } from "@/lib/supabase-products"

export default function AccesoriosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProductsByCategory("Accesorios").then((data) => {
      setProducts(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <main>
        <Navbar />
        <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 text-primary mb-6">
              <span className="text-xl">✦</span>
              <div className="w-16 h-px bg-primary" />
              <span className="text-xl">✦</span>
            </div>
            <p className="font-serif text-muted-foreground italic">Cargando accesorios...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main>
      <Navbar />
      <CollectionPage
        title="Accesorios"
        subtitle="Fe y elegancia en cada detalle"
        products={products as any}
        backgroundImage="https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=2070&auto=format&fit=crop"
      />
      <Footer />
    </main>
  )
}

