import Link from "next/link"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-primary overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1551028719-00167b16ebc5?q=80&w=2070&auto=format&fit=crop')`,
        }}
      />
      <div className="absolute inset-0 bg-primary/75" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="font-sans text-5xl md:text-7xl lg:text-8xl font-bold text-background tracking-wider mb-6">
          NEVADA
        </h1>
        <p className="font-serif text-lg md:text-xl lg:text-2xl text-background/95 mb-10">
          Chaquetas de Cuero y Ovejeras Premium
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href="/mujer"
            className="px-8 py-3 bg-background text-primary font-serif text-sm uppercase tracking-wider hover:bg-background/90 transition-colors rounded-sm font-semibold"
          >
            Colección Mujer
          </Link>
          <Link
            href="/hombre"
            className="px-8 py-3 border-2 border-background text-background font-serif text-sm uppercase tracking-wider hover:bg-background hover:text-primary transition-colors rounded-sm font-semibold"
          >
            Colección Hombre
          </Link>
        </div>

        {/* Ornamental Divider */}
        <div className="flex items-center justify-center gap-4 text-background">
          <span className="text-xl">⛰</span>
          <div className="w-24 md:w-32 h-px bg-background" />
          <span className="text-xl">⛰</span>
        </div>
      </div>
    </section>
  )
}
