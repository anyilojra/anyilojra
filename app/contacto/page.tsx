"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { saveContactMessage } from "@/lib/db/messages"
import { Mail, Phone, MapPin, Send, Check, Loader2 } from "lucide-react"
import type { FormEvent } from "react"

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError("")
    
    try {
      const result = await saveContactMessage(formData)
      
      if (!result.success) {
        throw new Error(result.error || "Failed to save message")
      }
      
      setSubmitSuccess(true)
      setFormData({ name: "", email: "", subject: "", message: "" })
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000)
      
    } catch (error) {
      console.error('[v0] Error al enviar mensaje:', error)
      setSubmitError("Hubo un error al enviar tu mensaje. Por favor intenta de nuevo.")
    }
    
    setIsSubmitting(false)
  }

  return (
    <main>
      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        {/* Hero */}
        <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=2074&auto=format&fit=crop')` }}
          />
          <div className="absolute inset-0 bg-foreground/70" />
          
          <div className="relative z-10 text-center px-4">
            <div className="flex items-center justify-center gap-4 text-primary mb-6">
              <span className="text-xl">✦</span>
              <div className="w-16 h-px bg-primary" />
              <span className="text-xl">✦</span>
            </div>
            <h1 className="font-sans text-4xl md:text-5xl lg:text-6xl font-bold text-background tracking-wider mb-4">
              Contacto
            </h1>
            <p className="font-serif text-lg md:text-xl text-background/90 italic">
              Estamos aquí para servirte
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-primary text-2xl">✝</span>
              </div>
              <h2 className="font-sans text-3xl font-bold text-foreground mb-6">
                Hablemos
              </h2>
              <p className="font-serif text-muted-foreground mb-8 leading-relaxed">
                ¿Tienes alguna pregunta sobre nuestros productos o necesitas ayuda con tu pedido? 
                Estamos aquí para ayudarte. Escríbenos y te responderemos lo antes posible.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-sans font-semibold text-foreground">Email</h3>
                    <p className="font-serif text-muted-foreground">gabriel.santoyotorres@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-sans font-semibold text-foreground">Teléfono</h3>
                    <p className="font-serif text-muted-foreground">+57 300 849 8089</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-sans font-semibold text-foreground">Ubicación</h3>
                    <p className="font-serif text-muted-foreground">Bucaramanga, Colombia</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-card p-8 rounded-lg shadow-sm border border-border">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block font-sans text-sm font-semibold text-foreground uppercase tracking-wider mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-border rounded-sm bg-background font-serif text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="Tu nombre"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block font-sans text-sm font-semibold text-foreground uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-border rounded-sm bg-background font-serif text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block font-sans text-sm font-semibold text-foreground uppercase tracking-wider mb-2">
                    Asunto
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-border rounded-sm bg-background font-serif text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="¿En qué podemos ayudarte?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block font-sans text-sm font-semibold text-foreground uppercase tracking-wider mb-2">
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-border rounded-sm bg-background font-serif text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
                    placeholder="Escribe tu mensaje aquí..."
                  />
                </div>

                {submitSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 text-green-800">
                      <Check className="w-5 h-5" />
                      <p className="font-serif text-sm">¡Mensaje enviado exitosamente! Te contactaremos pronto.</p>
                    </div>
                  </div>
                )}
                
                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="font-serif text-sm text-red-800">{submitError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-serif text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar Mensaje
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  )
}
