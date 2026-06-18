"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, Save } from "lucide-react"

export default function ConfiguracionPage() {
  const [companyName, setCompanyName] = useState("Nevada")
  const [primaryColor, setPrimaryColor] = useState("#001456")
  const [secondaryColor, setSecondaryColor] = useState("#003fa8")
  const [backgroundColor, setBackgroundColor] = useState("#f8f8f8")
  const [logoUrl, setLogoUrl] = useState("/logo-nevada.svg")
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // Guardar en localStorage (en producción sería en base de datos)
    const config = {
      companyName,
      primaryColor,
      secondaryColor,
      backgroundColor,
      logoUrl,
    }
    localStorage.setItem("nevada_company_config", JSON.stringify(config))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="pt-8 pb-16 px-4 md:px-8 max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-sans text-2xl md:text-3xl font-bold text-foreground leading-none">
              Configuración
            </h1>
            <p className="text-sm text-muted-foreground font-serif mt-2">
              Personaliza colores, logo y nombre de la empresa
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-lg p-8 space-y-8">
          
          {/* Nombre de la empresa */}
          <div>
            <label className="block text-sm font-sans font-semibold text-foreground mb-3">
              Nombre de la Empresa
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-serif"
              placeholder="Nombre de tu empresa"
            />
          </div>

          {/* Color primario */}
          <div>
            <label className="block text-sm font-sans font-semibold text-foreground mb-3">
              Color Primario
            </label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-16 h-16 rounded-sm cursor-pointer border border-border"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 px-4 py-3 border border-border rounded-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                placeholder="#001456"
              />
            </div>
          </div>

          {/* Color secundario */}
          <div>
            <label className="block text-sm font-sans font-semibold text-foreground mb-3">
              Color Secundario
            </label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-16 h-16 rounded-sm cursor-pointer border border-border"
              />
              <input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="flex-1 px-4 py-3 border border-border rounded-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                placeholder="#003fa8"
              />
            </div>
          </div>

          {/* Color de fondo */}
          <div>
            <label className="block text-sm font-sans font-semibold text-foreground mb-3">
              Color de Fondo
            </label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-16 h-16 rounded-sm cursor-pointer border border-border"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="flex-1 px-4 py-3 border border-border rounded-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                placeholder="#f8f8f8"
              />
            </div>
          </div>

          {/* URL del logo */}
          <div>
            <label className="block text-sm font-sans font-semibold text-foreground mb-3">
              URL del Logo
            </label>
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-serif text-sm"
              placeholder="/logo-nevada.svg"
            />
            <p className="text-xs text-muted-foreground font-serif mt-2">
              Usa rutas locales (ej: /logo.svg) o URLs completas
            </p>
          </div>

          {/* Preview */}
          <div className="border-t border-border pt-8">
            <h3 className="font-sans font-semibold text-foreground mb-4">
              Vista Previa
            </h3>
            <div
              className="p-8 rounded-lg border-2"
              style={{ backgroundColor, borderColor: primaryColor }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span style={{ color: backgroundColor }} className="font-bold text-lg">
                    N
                  </span>
                </div>
                <div>
                  <h4
                    className="font-sans font-bold text-lg"
                    style={{ color: primaryColor }}
                  >
                    {companyName}
                  </h4>
                  <p style={{ color: secondaryColor }} className="text-xs font-serif">
                    Tienda Online
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  style={{ backgroundColor: primaryColor, color: backgroundColor }}
                  className="px-4 py-2 rounded-sm font-serif text-sm uppercase tracking-wider"
                >
                  Botón Primario
                </button>
                <button
                  style={{ backgroundColor: secondaryColor, color: backgroundColor }}
                  className="px-4 py-2 rounded-sm font-serif text-sm uppercase tracking-wider"
                >
                  Botón Secundario
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="border-t border-border pt-8 flex gap-4">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-serif text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors rounded-sm"
            >
              <Save className="w-4 h-4" />
              Guardar Configuración
            </button>
            {saved && (
              <div className="inline-flex items-center gap-2 px-4 py-3 bg-green-100 text-green-800 font-serif text-sm rounded-sm">
                ✓ Configuración guardada
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-serif">
              <strong>Nota:</strong> Las configuraciones se guardan localmente. Para que aparezcan en toda la tienda, los cambios deben aplicarse también en los componentes principales de la aplicación.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
