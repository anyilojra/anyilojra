import { ProductCard } from "./product-card"
import { Product } from "@/lib/products"
import Link from "next/link"

interface CollectionPageProps {
  title: string
  subtitle: string
  products: Product[]
  backgroundImage: string
}

export function CollectionPage({ title, subtitle, products, backgroundImage }: CollectionPageProps) {
  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Hero Banner */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
        />
        <div className="absolute inset-0 bg-foreground/60" />
        
        <div className="relative z-10 text-center px-4">
          <div className="flex items-center justify-center gap-4 text-primary mb-4">
            <span className="text-xl">✦</span>
            <div className="w-16 h-px bg-primary" />
            <span className="text-xl">✦</span>
          </div>
          <h1 className="font-sans text-4xl md:text-5xl lg:text-6xl font-bold text-background tracking-wider mb-4">
            {title}
          </h1>
          <p className="font-serif text-lg md:text-xl text-background/90 italic">
            {subtitle}
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center gap-2 text-sm font-serif text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <span className="text-foreground">{title}</span>
        </nav>
      </div>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <p className="font-serif text-muted-foreground">
            {products.length} productos encontrados
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>
    </div>
  )
}
