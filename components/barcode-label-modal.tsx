"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { type Product } from "@/lib/supabase-products"
import { X, Printer } from "lucide-react"

interface BarcodeLabelProps {
  products: Product[]
  onClose: () => void
}

function drawBarcode(canvas: HTMLCanvasElement, code: string) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const W = canvas.width
  const H = canvas.height
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, W, H)

  const bars: number[] = []
  for (let i = 0; i < code.length; i++) {
    const v = code.charCodeAt(i)
    for (let b = 6; b >= 0; b--) {
      bars.push((v >> b) & 1)
    }
  }
  const full = [1, 0, 1, ...bars, 1, 1, 0, 1, 0, 1]

  const barW = Math.max(1, Math.floor(W / full.length))
const barH = H - 4
const totalWidth = barW * full.length
const offsetX = Math.floor((W - totalWidth) / 2)

ctx.fillStyle = "#000000"
full.forEach((bit, i) => {
  if (bit) ctx.fillRect(offsetX + i * barW, 2, barW, barH)
})
}
export function BarcodeLabelModal({ products, onClose }: BarcodeLabelProps) {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([])

  useEffect(() => {
    products.forEach((product, i) => {
      const canvas = canvasRefs.current[i]
      if (canvas && product.barcode) {
        drawBarcode(canvas, product.barcode)
      }
    })
  }, [products])

  function handlePrint() {
    const labels = products.map((product, i) => {
      const canvas = canvasRefs.current[i]
      const barcodeDataUrl = canvas ? canvas.toDataURL("image/png") : ""
      const price = new Intl.NumberFormat("es-CO", {
        style: "currency", currency: "COP", minimumFractionDigits: 0,
      }).format(product.price)

      return `
        <div class="label-card">
          <div class="brand">✦ SANTIZZIMA</div>
          <p class="product-name">${product.name}</p>
          <p class="price">${price}</p>
          ${barcodeDataUrl ? `<img src="${barcodeDataUrl}" class="barcode-img" />` : ""}
          <p class="barcode-num">${product.barcode || "—"}</p>
        </div>
      `
    }).join("")

    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(`
      <html><head><title>Etiquetas Santizzima</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: sans-serif; background: white; padding: 10mm; }
        .grid { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-start; }
        .label-card {
          width: 180px; border: 1px dashed #ccc; border-radius: 8px;
          padding: 10px; text-align: center; page-break-inside: avoid;
        }
        .brand { font-family: serif; font-size: 12px; font-weight: bold;
          letter-spacing: 2px; color: #1a0a00; margin-bottom: 4px; }
        .product-name { font-size: 10px; color: #1a0a00; margin: 4px 0;
          font-weight: 600; line-height: 1.3; }
        .price { font-size: 13px; font-weight: bold; color: #c8952a; margin: 4px 0; }
        .barcode-img { width: 100%; image-rendering: pixelated; display: block; margin: 4px 0; }
        .barcode-num { font-family: monospace; font-size: 8px; color: #5c4a3a; letter-spacing: 1px; }
      </style></head>
      <body><div class="grid">${labels}</div>
      <script>window.onload = function(){ window.print(); window.close(); }<\/script>
      </body></html>
    `)
    win.document.close()
  }

  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border px-5 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20Project%20-%20Standard%20%281%29-EEagyJk1pnfERasqx8vaeakjDXKfR8.svg"
              alt="Santizzima"
              width={28}
              height={28}
              className="w-6 h-6"
            />
            <h2 className="font-sans text-base font-semibold text-foreground">
              Etiquetas para imprimir ({products.length})
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-sans font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Labels grid */}
        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-4 justify-items-center">
          {products.map((product, i) => (
            <div
              key={product.id}
              className="border border-border rounded-lg p-3 flex flex-col items-center gap-2 bg-white w-full"
            >
              {/* Brand */}
              <div className="flex items-center gap-1.5">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20Project%20-%20Standard%20%281%29-EEagyJk1pnfERasqx8vaeakjDXKfR8.svg"
                  alt="Santizzima"
                  width={18}
                  height={18}
                  className="w-4 h-4"
                />
                <span className="font-sans text-xs font-bold tracking-widest text-[#1a0a00] uppercase">
                  Santizzima
                </span>
              </div>

              {/* Product name */}
              <p className="font-sans text-[11px] font-semibold text-center text-[#1a0a00] leading-tight">
                {product.name}
              </p>

              {/* Price */}
              <p className="font-sans text-sm font-bold text-[#c8952a]">
                {new Intl.NumberFormat("es-CO", {
                  style: "currency",
                  currency: "COP",
                  minimumFractionDigits: 0,
                }).format(product.price)}
              </p>

              {/* Barcode canvas */}
              <canvas
                ref={(el) => { canvasRefs.current[i] = el }}
                width={160}
                height={50}
                className="w-full"
                style={{ imageRendering: "pixelated" }}
              />

              {/* Barcode number */}
              <p className="font-mono text-[9px] text-[#5c4a3a] tracking-widest">
                {product.barcode || "—"}
              </p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground pb-4">
          Usa el botón Imprimir · Recomendado: papel adhesivo A4, 3 columnas
        </p>
      </div>
    </div>
  )
}
