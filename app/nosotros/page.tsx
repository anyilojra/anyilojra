import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Image from "next/image"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Nosotros | Nevada",
  description: "Conoce la historia detrás de Nevada. Moda católica con propósito desde Colombia.",
}

export default function NosotrosPage() {
  return (
    <main>
      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        {/* Hero */}
        <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop')` }}
          />
          <div className="absolute inset-0 bg-foreground/70" />
          
          <div className="relative z-10 text-center px-4">
            <div className="flex items-center justify-center gap-4 text-primary mb-6">
              <span className="text-xl">✦</span>
              <div className="w-16 h-px bg-primary" />
              <span className="text-xl">✦</span>
            </div>
            <h1 className="font-sans text-4xl md:text-5xl lg:text-6xl font-bold text-background tracking-wider mb-4">
              Nuestra Historia
            </h1>
            <p className="font-serif text-lg md:text-xl text-background/90 italic max-w-2xl mx-auto">
              Fe, tradición y elegancia en cada puntada
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="prose prose-lg max-w-none">
            <div className="text-center mb-12">
              <span className="text-primary text-3xl">✝</span>
            </div>
            
            <p className="font-serif text-lg text-muted-foreground leading-relaxed mb-8">
              Santizzima nació de un sueño: vestir con propósito. En un mundo donde la moda 
              a menudo se aleja de los valores, decidimos crear una marca que celebre la fe 
              católica a través de prendas elegantes y atemporales.
            </p>

            <p className="font-serif text-lg text-muted-foreground leading-relaxed mb-8">
              Cada una de nuestras piezas lleva el nombre de un santo, recordándonos que la 
              verdadera belleza viene de adentro. Desde Bucaramanga, Colombia, confeccionamos 
              ropa que no solo viste el cuerpo, sino que también alimenta el alma.
            </p>

            <div className="relative aspect-video my-12 rounded-lg overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070&auto=format&fit=crop"
                alt="Taller Santizzima"
                fill
                className="object-cover"
              />
            </div>

            <h2 className="font-sans text-2xl font-bold text-foreground mb-6">
              Nuestra Misión
            </h2>
            
            <p className="font-serif text-lg text-muted-foreground leading-relaxed mb-8">
              Crear moda que inspire a vivir la fe con elegancia. Cada prenda es una 
              declaración de identidad católica, diseñada para quienes buscan vestir 
              con modestia sin sacrificar el estilo.
            </p>

            <h2 className="font-sans text-2xl font-bold text-foreground mb-6">
              Nuestros Valores
            </h2>

            <div className="grid md:grid-cols-3 gap-8 my-12">
              <div className="text-center">
                <div className="text-primary text-2xl mb-4">✦</div>
                <h3 className="font-sans text-lg font-semibold text-foreground mb-2">Fe</h3>
                <p className="font-serif text-muted-foreground text-sm">
                  Cada diseño está inspirado en los santos y la tradición católica.
                </p>
              </div>
              <div className="text-center">
                <div className="text-primary text-2xl mb-4">✦</div>
                <h3 className="font-sans text-lg font-semibold text-foreground mb-2">Calidad</h3>
                <p className="font-serif text-muted-foreground text-sm">
                  Materiales premium y confección artesanal en cada prenda.
                </p>
              </div>
              <div className="text-center">
                <div className="text-primary text-2xl mb-4">✦</div>
                <h3 className="font-sans text-lg font-semibold text-foreground mb-2">Propósito</h3>
                <p className="font-serif text-muted-foreground text-sm">
                  Moda que trasciende tendencias y alimenta el espíritu.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  )
}
