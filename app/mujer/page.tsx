import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CollectionPage } from "@/components/collection-page"
import { createClient } from "@/utils/supabase/server"
import { getProductsByCategory } from "@/lib/products"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Colección Mujer | Nevada",
  description: "Descubre nuestra colección de moda católica para mujer. Vestidos, blusas y faldas con elegancia y fe.",
}

export default async function MujerPage() {
  let products = getProductsByCategory("Mujer")
  
  try {
    const supabase = await createClient()
    
    if (supabase) {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'Mujer')
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
        title="Colección Mujer"
        subtitle="Elegancia femenina con propósito divino"
        products={products}
        backgroundImage="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop"
      />
      <Footer />
    </main>
  )
}
