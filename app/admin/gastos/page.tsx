"use client"

import Link from "next/link"
import { ChevronLeft, Receipt } from "lucide-react"

export default function AdminGastosPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-muted rounded-lg transition">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="font-sans text-2xl md:text-3xl font-bold text-foreground">Gastos</h1>
              <p className="text-sm text-muted-foreground font-serif mt-1">Registro de gastos</p>
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Receipt className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="font-sans text-xl font-semibold text-foreground mb-2">Registro de Gastos</h2>
            <p className="text-muted-foreground text-center max-w-md">
              Registra y controla todos los gastos asociados con tu negocio para mejor seguimiento.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
