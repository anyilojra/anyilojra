import { ProductCard } from "./product-card"
import { products as staticProducts } from "@/lib/products"

export async function FeaturedProducts() {
  const products = staticProducts.slice(0, 8)

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-primary text-2xl">⛰</span>
          </div>
          <h2 className="font-sans text-3xl md:text-4xl font-bold text-primary">
            Colección Destacada
          </h2>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              id={product.id}
              name={product.name}
              price={product.price}
              category={product.category}
              image={product.image}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
