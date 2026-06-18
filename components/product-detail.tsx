import { ProductDetailClient } from "@/components/product-detail-client"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function ProductDetail() {
  return (
    <main>
      <Navbar />
      <ProductDetailClient />
      <Footer />
    </main>
  )
}
