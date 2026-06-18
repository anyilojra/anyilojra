import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CollectionPage } from "@/components/collection-page"
import { createClient } from "@/utils/supabase/server"
import { getProductsByCategory } from "@/lib/products"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Colección Hombre | Nevada",
  description: "Descubre nuestra colección de moda católica para hombre. Camisas, pantalones y chaquetas con estilo y fe.",
}

export default async function HombrePage() {
  let products = getProductsByCategory("Hombre")
  
  try {
    const supabase = await createClient()
    
    if (supabase) {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'Hombre')
        .order('created_at', { ascending: false })
      
      if (data && data.length > 0) {
        products = data
      }
    }
  } catch {
    // Use static products as fallback
  }

  return (
    <main>
      <Navbar />
      <CollectionPage
        title="Colección Hombre"
        subtitle="Fortaleza y elegancia con fe"
        products={products}
        backgroundImage="https://images.unsplash.com/photo-1507680434567-5739c80be1ac?q=80&w=2070&auto=format&fit=crop"
      />
      <Footer />
    </main>
  )
}
