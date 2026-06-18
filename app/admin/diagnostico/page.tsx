"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { createClient } from "@/utils/supabase/client"

export default function DiagnosticoPage() {
  const [results, setResults] = useState<string[]>([])
  const [testing, setTesting] = useState(false)

  async function runDiagnostics() {
    setTesting(true)
    setResults([])
    const logs: string[] = []

    // Test 1: Check environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    logs.push(`1. NEXT_PUBLIC_SUPABASE_URL: ${url ? `Configurada (${url.substring(0, 30)}...)` : "NO CONFIGURADA"}`)
    logs.push(`2. NEXT_PUBLIC_SUPABASE_ANON_KEY: ${key ? `Configurada (${key.substring(0, 20)}...)` : "NO CONFIGURADA"}`)

    // Test 2: Try to create client
    const supabase = createClient()
    logs.push(`3. Cliente Supabase: ${supabase ? "Creado correctamente" : "ERROR - No se pudo crear"}`)

    if (!supabase) {
      logs.push("ERROR: No se puede continuar sin cliente de Supabase")
      setResults(logs)
      setTesting(false)
      return
    }

    // Test 3: Try to read products
    try {
      const { data, error, count } = await supabase
        .from("products")
        .select("*", { count: "exact" })

      if (error) {
        logs.push(`4. Leer productos: ERROR - ${error.message}`)
        logs.push(`   Código: ${error.code}`)
        logs.push(`   Detalles: ${error.details || "Sin detalles"}`)
      } else {
        logs.push(`4. Leer productos: OK - ${data?.length || 0} productos encontrados`)
      }
    } catch (err) {
      logs.push(`4. Leer productos: EXCEPCIÓN - ${err}`)
    }

    // Test 4: Try to insert a test product
    try {
      const testProduct = {
        name: "TEST_PRODUCTO_BORRAR",
        price: 1000,
        category: "Mujer",
        image: "https://test.com/test.jpg",
        description: "Producto de prueba - borrar",
        sizes: ["S"],
        colors: ["Test"]
      }

      const { data, error } = await supabase
        .from("products")
        .insert([testProduct])
        .select()
        .single()

      if (error) {
        logs.push(`5. Insertar producto: ERROR - ${error.message}`)
        logs.push(`   Código: ${error.code}`)
        logs.push(`   Hint: ${error.hint || "Sin hint"}`)
      } else {
        logs.push(`5. Insertar producto: OK - ID: ${data?.id}`)
        
        // Delete test product
        const { error: deleteError } = await supabase
          .from("products")
          .delete()
          .eq("id", data.id)
        
        if (deleteError) {
          logs.push(`6. Eliminar producto de prueba: ERROR - ${deleteError.message}`)
        } else {
          logs.push(`6. Eliminar producto de prueba: OK`)
        }
      }
    } catch (err) {
      logs.push(`5. Insertar producto: EXCEPCIÓN - ${err}`)
    }

    setResults(logs)
    setTesting(false)
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-sans text-foreground mb-8">Diagnóstico de Supabase</h1>
        
        <button
          onClick={runDiagnostics}
          disabled={testing}
          className="px-6 py-3 bg-primary text-primary-foreground rounded mb-8 disabled:opacity-50"
        >
          {testing ? "Ejecutando pruebas..." : "Ejecutar Diagnóstico"}
        </button>

        {results.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-sans mb-4">Resultados:</h2>
            <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded">
              {results.join("\n")}
            </pre>
          </div>
        )}

        <div className="mt-8 p-4 bg-muted rounded">
          <h3 className="font-semibold mb-2">Si hay errores:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Verifica que las variables de entorno estén en Vercel (Settings → Environment Variables)</li>
            <li>La URL debe ser: https://[tu-proyecto].supabase.co</li>
            <li>La key debe ser la &quot;anon public&quot; key completa (empieza con eyJ...)</li>
            <li>Después de cambiar variables, debes hacer un nuevo deploy</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
