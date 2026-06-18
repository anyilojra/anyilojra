import { getProductById } from "@/lib/products"
import ProductDetail from "@/components/product-detail"
import type { Metadata } from "next"

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProductById(params.id)
  
  if (product) {
    return {
      title: `${product.name} | Nevada`,
      description: product.description,
      openGraph: {
        title: `${product.name} | Nevada`,
        description: product.description,
        images: [product.image],
      },
    }
  }

  return {
    title: 'Producto | Nevada',
  }
}

export default function ProductoPage() {
  return <ProductDetail />
}
