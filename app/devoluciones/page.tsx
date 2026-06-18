import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import type { Metadata } from "next"
import Link from "next/link"
import {
  RotateCcw,
  PackageCheck,
  Clock,
  ShieldCheck,
  AlertCircle,
  ChevronRight,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Devoluciones y Cambios | Nevada",
  description:
    "Conoce nuestra política de devoluciones y cambios. En Nevada tu satisfacción es lo más importante.",
}

const steps = [
  {
    number: "01",
    title: "Contáctanos",
    description:
      "Escríbenos a ventas@santizzima.com o por WhatsApp al +57 300 849 8089 indicando tu número de pedido y el motivo de la devolución.",
  },
  {
    number: "02",
    title: "Autorización",
    description:
      "En un plazo de 24–48 horas hábiles te enviaremos la confirmación y las instrucciones de envío para tu devolución.",
  },
  {
    number: "03",
    title: "Envía el producto",
    description:
      "Empaca el artículo en su embalaje original, incluyendo etiquetas y accesorios. El envío corre por cuenta del cliente salvo defecto de fábrica.",
  },
  {
    number: "04",
    title: "Reembolso o cambio",
    description:
      "Una vez recibamos e inspeccionemos el producto, procesamos el cambio o reembolso en un plazo de 5–10 días hábiles.",
  },
]

const conditions = [
  {
    icon: Clock,
    title: "Plazo de 15 días",
    description:
      "Tienes 15 días calendario desde la fecha de entrega para solicitar una devolución o cambio.",
  },
  {
    icon: PackageCheck,
    title: "Estado original",
    description:
      "Los productos deben estar sin usar, sin lavar, con todas sus etiquetas originales y en su empaque.",
  },
  {
    icon: ShieldCheck,
    title: "Defectos de fábrica",
    description:
      "Si recibes un producto con defecto de fábrica, cubrimos el costo del envío de retorno sin costo adicional para ti.",
  },
  {
    icon: AlertCircle,
    title: "Excepciones",
    description:
      "No se aceptan devoluciones de productos en promoción final de temporada, prendas íntimas ni artículos personalizados.",
  },
]

export default function DevolucionesPage() {
  return (
    <main>
      <Navbar />
      <div className="min-h-screen bg-background pt-20">

        {/* Hero */}
        <section className="relative h-[45vh] min-h-[360px] flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2070&auto=format&fit=crop')`,
            }}
          />
          <div className="absolute inset-0 bg-foreground/72" />

          <div className="relative z-10 text-center px-4">
            <div className="flex items-center justify-center gap-4 text-primary mb-6">
              <span className="text-xl">✦</span>
              <div className="w-16 h-px bg-primary" />
              <span className="text-xl">✦</span>
            </div>
            <h1 className="font-sans text-4xl md:text-5xl lg:text-6xl font-bold text-background tracking-wider mb-4">
              Devoluciones y Cambios
            </h1>
            <p className="font-serif text-lg md:text-xl text-background/90 italic max-w-2xl mx-auto">
              Tu satisfacción es nuestra prioridad
            </p>
          </div>
        </section>

        {/* Intro */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <span className="text-primary text-3xl block mb-6">✝</span>
          <p className="font-serif text-lg text-muted-foreground leading-relaxed">
            En Santizzima cada prenda es confeccionada con fe y dedicación. Si por alguna razón
            tu compra no cumple tus expectativas, estamos aquí para ayudarte. Conoce nuestra
            política y los pasos para gestionar tu solicitud de forma sencilla.
          </p>
        </section>

        {/* Conditions grid */}
        <section className="bg-muted/40 border-y border-border py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-sans text-2xl md:text-3xl font-bold text-foreground tracking-wide mb-3">
                Condiciones de Devolución
              </h2>
              <div className="flex items-center justify-center gap-3 text-primary">
                <div className="h-px w-12 bg-primary" />
                <span className="text-sm">✦</span>
                <div className="h-px w-12 bg-primary" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {conditions.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="bg-card border border-border rounded-lg p-6 flex flex-col items-start gap-4 hover:border-primary/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-sans text-base font-semibold text-foreground mb-1">
                      {title}
                    </h3>
                    <p className="font-serif text-sm text-muted-foreground leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Step-by-step process */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <h2 className="font-sans text-2xl md:text-3xl font-bold text-foreground tracking-wide mb-3">
              ¿Cómo solicitar una devolución?
            </h2>
            <div className="flex items-center justify-center gap-3 text-primary">
              <div className="h-px w-12 bg-primary" />
              <span className="text-sm">✦</span>
              <div className="h-px w-12 bg-primary" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-[1.9rem] top-8 bottom-8 w-px bg-border hidden md:block" />
            <div className="space-y-8">
              {steps.map((step) => (
                <div key={step.number} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full border-2 border-primary bg-background flex items-center justify-center z-10">
                    <span className="font-sans text-xs font-bold text-primary tracking-widest">
                      {step.number}
                    </span>
                  </div>
                  <div className="flex-1 pb-2 pt-3">
                    <h3 className="font-sans text-lg font-semibold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="font-serif text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Refund methods */}
        <section className="bg-foreground text-background py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="font-sans text-2xl md:text-3xl font-bold tracking-wide mb-3">
                Métodos de Reembolso
              </h2>
              <div className="flex items-center justify-center gap-3 text-primary">
                <div className="h-px w-12 bg-primary" />
                <span className="text-sm">✦</span>
                <div className="h-px w-12 bg-primary" />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Cambio de producto",
                  desc: "Selecciona otra talla, color o referencia disponible en nuestro catálogo.",
                },
                {
                  title: "Nota crédito",
                  desc: "Recibe el valor como crédito en tu próxima compra, sin fecha de vencimiento.",
                },
                {
                  title: "Reembolso bancario",
                  desc: "Transferencia al mismo medio de pago original en 5–10 días hábiles.",
                },
              ].map(({ title, desc }) => (
                <div
                  key={title}
                  className="border border-background/20 rounded-lg p-6 hover:border-primary/60 transition-colors"
                >
                  <div className="text-primary text-xl mb-4">✦</div>
                  <h3 className="font-sans text-base font-semibold mb-2">{title}</h3>
                  <p className="font-serif text-sm text-background/70 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="font-sans text-2xl md:text-3xl font-bold text-foreground tracking-wide mb-3">
              Preguntas Frecuentes
            </h2>
            <div className="flex items-center justify-center gap-3 text-primary">
              <div className="h-px w-12 bg-primary" />
              <span className="text-sm">✦</span>
              <div className="h-px w-12 bg-primary" />
            </div>
          </div>

          <div className="divide-y divide-border">
            {[
              {
                q: "¿Cuánto tiempo tengo para solicitar la devolución?",
                a: "Tienes 15 días calendario contados desde la fecha en que recibiste tu pedido.",
              },
              {
                q: "¿Quién paga el envío de retorno?",
                a: "Si el producto presenta un defecto de fábrica, Santizzima cubre el costo del envío de retorno. En los demás casos, el envío corre por cuenta del cliente.",
              },
              {
                q: "¿Puedo devolver un producto en promoción?",
                a: "Los productos marcados como 'liquidación final' o 'sin devolución' no son elegibles para cambio ni reembolso.",
              },
              {
                q: "¿En cuánto tiempo recibo mi reembolso?",
                a: "Una vez inspeccionemos el producto devuelto, procesamos el reembolso en un plazo de 5 a 10 días hábiles.",
              },
              {
                q: "¿Qué hago si recibí un producto incorrecto?",
                a: "Contáctanos de inmediato por WhatsApp o correo electrónico. En ese caso cubrimos todos los costos de envío y damos prioridad a tu solicitud.",
              },
            ].map(({ q, a }) => (
              <details key={q} className="group py-5 cursor-pointer list-none">
                <summary className="flex items-center justify-between font-sans text-base font-semibold text-foreground hover:text-primary transition-colors list-none">
                  {q}
                  <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 transition-transform duration-200 group-open:rotate-90" />
                </summary>
                <p className="font-serif text-muted-foreground leading-relaxed mt-3 pr-6">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-muted/40 border-t border-border py-16">
          <div className="max-w-xl mx-auto px-4 text-center">
            <RotateCcw className="w-10 h-10 text-primary mx-auto mb-5" />
            <h2 className="font-sans text-2xl font-bold text-foreground mb-3 tracking-wide">
              ¿Necesitas ayuda con tu devolución?
            </h2>
            <p className="font-serif text-muted-foreground mb-8 leading-relaxed">
              Nuestro equipo está disponible de lunes a viernes de 8 a.m. a 6 p.m. y los
              sábados de 9 a.m. a 1 p.m. (hora Colombia).
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 px-7 py-3 bg-primary text-primary-foreground font-sans text-sm font-semibold tracking-wide rounded hover:bg-primary/90 transition-colors"
              >
                Contactar soporte
              </Link>
              <a
                href="https://wa.me/573008498089"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3 border border-foreground text-foreground font-sans text-sm font-semibold tracking-wide rounded hover:bg-foreground hover:text-background transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </section>

      </div>
      <Footer />
    </main>
  )
}
