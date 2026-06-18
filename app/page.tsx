import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { FeaturedProducts } from "@/components/featured-products"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: 'Nevada | Chaquetas de Cuero y Ovejeras Premium',
  description: 'Confeccionadores y distribuidores de chaquetas en cueros y tipo ovejeras para hombre y mujer. Diseño premium, calidad garantizada, envíos a todo el país.',
  keywords: ['chaquetas de cuero', 'ovejeras', 'chaquetas cuero hombre', 'chaquetas cuero mujer', 'prendas de cuero Colombia'],
  openGraph: {
    title: 'Nevada | Chaquetas de Cuero y Ovejeras Premium',
    description: 'Confeccionadores y distribuidores de chaquetas en cueros y tipo ovejeras para hombre y mujer. Diseño premium, calidad garantizada.',
    url: 'https://www.nevada.com',
    siteName: 'Nevada',
    locale: 'es_CO',
    type: 'website',
  },
}

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <FeaturedProducts />
      <Footer />
    </main>
  )
}
