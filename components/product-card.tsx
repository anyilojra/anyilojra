import Image from "next/image"
import Link from "next/link"

interface ProductCardProps {
  id: string
  name: string
  price: number
  category: "Mujer" | "Hombre"
  image: string
}

export function ProductCard({ id, name, price, category, image }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)

  return (
    <article className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Category Badge */}
        <span className={`absolute top-3 left-3 px-3 py-1 text-xs font-serif uppercase tracking-wider rounded-sm ${
          category === "Mujer" 
            ? "bg-accent text-accent-foreground" 
            : "bg-foreground text-background"
        }`}>
          {category}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-sans text-lg font-semibold text-foreground mb-1 line-clamp-1">
          {name}
        </h3>
        <p className="font-serif text-primary font-medium mb-4">
          {formattedPrice}
        </p>
        <Link
          href={`/producto/${id}`}
          className="inline-block w-full text-center px-4 py-2 bg-primary text-primary-foreground font-serif text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors rounded-sm"
        >
          Ver detalle
        </Link>
      </div>
    </article>
  )
}
