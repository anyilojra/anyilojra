"use client"

import Link from "next/link"
import { ChevronLeft, TrendingUp } from "lucide-react"

export default function AdminCostosPage() {
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
              <h1 className="font-sans text-2xl md:text-3xl font-bold text-foreground">Costos</h1>
              <p className="text-sm text-muted-foreground font-serif mt-1">Gestión de costos</p>
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="font-sans text-xl font-semibold text-foreground mb-2">Gestión de Costos</h2>
            <p className="text-muted-foreground text-center max-w-md">
              Registra y gestiona los costos operativos de tu negocio para optimizar tus gastos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
