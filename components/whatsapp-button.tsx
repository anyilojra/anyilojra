"use client"

import { MessageCircle } from "lucide-react"

const PHONE = "573008498089"
const MESSAGE = encodeURIComponent("Hola, me interesa un producto de Santizzima 😊")
const WHATSAPP_URL = `https://wa.me/${PHONE}?text=${MESSAGE}`

export function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95"
      style={{ backgroundColor: "#25D366" }}
    >
      {/* WhatsApp SVG oficial */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="w-8 h-8"
        fill="white"
      >
        <path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.736 5.473 2.027 7.774L0 32l8.437-2.01A15.934 15.934 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 0 1-6.756-1.843l-.485-.287-5.01 1.195 1.237-4.882-.317-.503A13.267 13.267 0 0 1 2.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.875c-.398-.199-2.355-1.162-2.72-1.294-.366-.133-.632-.199-.898.199-.265.398-1.03 1.294-1.263 1.56-.232.265-.465.298-.863.1-.398-.199-1.68-.619-3.2-1.975-1.183-1.055-1.981-2.358-2.214-2.756-.232-.398-.025-.613.175-.812.179-.178.398-.465.597-.698.2-.232.265-.398.398-.664.133-.265.066-.498-.033-.697-.1-.199-.898-2.165-1.23-2.963-.324-.778-.653-.673-.898-.686l-.765-.013c-.265 0-.697.1-.1063.498-.365.398-1.396 1.362-1.396 3.322 0 1.96 1.43 3.854 1.629 4.12.199.265 2.815 4.298 6.822 6.027.954.412 1.698.657 2.28.841.957.305 1.829.262 2.518.159.768-.114 2.355-.963 2.688-1.893.332-.93.332-1.727.232-1.893-.099-.166-.365-.265-.763-.464z"/>
      </svg>

      {/* Pulso animado */}
      <span
        className="absolute inset-0 rounded-full animate-ping opacity-30"
        style={{ backgroundColor: "#25D366" }}
      />
    </a>
  )
}
