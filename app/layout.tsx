import type { Metadata } from 'next'
import { Playfair_Display, Lora } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/lib/cart-context'

import { ConditionalUI } from '@/components/conditional-ui'
import './globals.css'

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair',
});

const lora = Lora({ 
  subsets: ["latin"],
  variable: '--font-lora',
});

export const metadata: Metadata = {
  title: 'Nevada | Chaquetas de Cuero y Ovejeras Premium',
  description: 'Descubre nuestra colección de chaquetas de cuero y ovejeras premium para hombre y mujer. Diseño, calidad y estilo. Confeccionados en Colombia.',
  verification: {
    google: 'JOr_03VLkThikUrbF_UmC86nhwiE1kad7GsW_J_i338',
  },
  alternates: {
    canonical: 'https://www.nevada.com',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-background">
      <body className={`${playfair.variable} ${lora.variable} font-serif antialiased`}>
        <CartProvider>
          {children}
          <ConditionalUI />
        </CartProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
