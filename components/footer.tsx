import Image from "next/image"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-primary text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image 
                src="/logo-nevada.svg"
                alt="Nevada Logo" 
                width={32} 
                height={32}
                className="w-8 h-8"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <span className="font-sans text-xl font-bold tracking-wide">
                NEVADA
              </span>
            </Link>
            <p className="font-serif text-background/70 text-sm leading-relaxed">
              Confeccionadores y distribuidores de chaquetas en cueros y tipo ovejeras. Diseño, calidad y estilo desde Colombia.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-sans text-sm font-semibold uppercase tracking-wider mb-4">
              Colecciones
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/mujer" className="font-serif text-sm text-background/70 hover:text-secondary transition-colors">
                  Mujer
                </Link>
              </li>
              <li>
                <Link href="/hombre" className="font-serif text-sm text-background/70 hover:text-secondary transition-colors">
                  Hombre
                </Link>
              </li>
              <li>
                <Link href="/accesorios" className="font-serif text-sm text-background/70 hover:text-secondary transition-colors hidden">
                  Accesorios
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans text-sm font-semibold uppercase tracking-wider mb-4">
              Información
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/nosotros" className="font-serif text-sm text-background/70 hover:text-secondary transition-colors">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="font-serif text-sm text-background/70 hover:text-secondary transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/seguimiento" className="font-serif text-sm text-background/70 hover:text-secondary transition-colors">
                  Envíos
                </Link>
              </li>
              <li>
                <Link href="/devoluciones" className="font-serif text-sm text-background/70 hover:text-secondary transition-colors">
                  Devoluciones
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans text-sm font-semibold uppercase tracking-wider mb-4">
              Contacto
            </h4>
            <ul className="space-y-2 font-serif text-sm text-background/70">
              <li>ventas@nevada.com</li>
              <li>+57 300 XXX XXXX</li>
              <li>Colombia</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-serif text-sm text-background/50">
              &copy; {new Date().getFullYear()} Nevada. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4 text-secondary">
              <span className="text-sm">⛰</span>
              <span className="font-serif text-sm text-background/50">
                Cuero de Calidad
              </span>
              <span className="text-sm">⛰</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
