export interface Product {
  id: string
  name: string
  price: number
  category: "Mujer" | "Hombre"
  image: string
  description: string
  sizes: string[]
  colors: string[]
}

export const products: Product[] = [
  {
    id: "chaqueta-cuero-hombre-1",
    name: "Chaqueta Cuero Biker Hombre",
    price: 450000,
    category: "Hombre",
    image: "/images/chaqueta-cuero-1-hombre.png",
    description: "Chaqueta de cuero premium confeccionada artesanalmente. Diseño clásico biker con acabados de lujo. Cuero suave y duradero.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Marrón oscuro", "Negro", "Café"],
  },
  {
    id: "chaqueta-cuero-mujer-1",
    name: "Chaqueta Cuero Elegante Mujer",
    price: 425000,
    category: "Mujer",
    image: "/images/chaqueta-cuero-2-mujer.png",
    description: "Chaqueta de cuero negro con ajuste perfecto. Diseño sofisticado para mujer. Confeccionada en suede premium de alta calidad.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Negro", "Marrón", "Rojo burdeos"],
  },
  {
    id: "ovejera-hombre-1",
    name: "Ovejera Clásica Hombre",
    price: 380000,
    category: "Hombre",
    image: "/images/ovejera-hombre.png",
    description: "Ovejera tradicional con lana natural. Cuero exterior de calidad. Perfecta para clima frío. Confort y durabilidad garantizados.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Camel", "Chocolate", "Negro"],
  },
  {
    id: "ovejera-mujer-1",
    name: "Ovejera Luxe Mujer",
    price: 395000,
    category: "Mujer",
    image: "/images/ovejera-mujer.png",
    description: "Ovejera de lujo con lana premium. Cuero cognac suave. Diseño femenino y cómodo. Ideal para cualquier ocasión.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Crema", "Camel", "Gris"],
  },
  {
    id: "chaqueta-cuero-hombre-2",
    name: "Chaqueta Cuero Racing Hombre",
    price: 480000,
    category: "Hombre",
    image: "https://images.unsplash.com/photo-1551028719-00167b16ebc5?q=80&w=500&auto=format&fit=crop",
    description: "Chaqueta de cuero con detalles deportivos. Cuero italiano de primera calidad. Cortes precisos y acabados impecables.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Negro", "Blanco", "Rojo"],
  },
  {
    id: "chaqueta-cuero-mujer-2",
    name: "Chaqueta Cuero Moto Mujer",
    price: 440000,
    category: "Mujer",
    image: "https://images.unsplash.com/photo-1551028719-00167b16ebc5?q=80&w=500&auto=format&fit=crop",
    description: "Chaqueta moto para mujer con cuero suave. Diseño moderno y funcional. Bolsillos estratégicos y cremalleras de calidad.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Negro", "Burdeos", "Cognac"],
  },
  {
    id: "ovejera-hombre-2",
    name: "Ovejera Premium Hombre",
    price: 420000,
    category: "Hombre",
    image: "https://images.unsplash.com/photo-1551033406-611cf9a28f58?q=80&w=500&auto=format&fit=crop",
    description: "Ovejera con forro de lana virgen. Cuero de máxima calidad. Confección perfecta en todos los detalles. Durabilidad extrema.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Negro", "Marrón", "Tostado"],
  },
  {
    id: "ovejera-mujer-2",
    name: "Ovejera Vintage Mujer",
    price: 410000,
    category: "Mujer",
    image: "https://images.unsplash.com/photo-1551033406-611cf9a28f58?q=80&w=500&auto=format&fit=crop",
    description: "Ovejera con look vintage y acabados modernos. Lana cálida y cuero resistente. Perfecta para el invierno en estilo.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Negro", "Camel", "Beige"],
  },
  {
    id: "chaqueta-cuero-hombre-3",
    name: "Chaqueta Cuero Café Hombre",
    price: 460000,
    category: "Hombre",
    image: "https://images.unsplash.com/photo-1520975867468-30ee46efdd3f?q=80&w=500&auto=format&fit=crop",
    description: "Chaqueta de cuero café con corte versátil. Cuero natural curtido tradicionalmente. Ideal para looks casual y elegantes.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Café", "Chocolate", "Cobrizo"],
  },
  {
    id: "chaqueta-cuero-mujer-3",
    name: "Chaqueta Cuero Fitted Mujer",
    price: 435000,
    category: "Mujer",
    image: "https://images.unsplash.com/photo-1520975867468-30ee46efdd3f?q=80&w=500&auto=format&fit=crop",
    description: "Chaqueta ceñida de cuero para mujer. Diseño con cintura marcada. Cuero suave y flexible. Perfecta para cualquier atuendo.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Negro", "Marrón", "Verde oscuro"],
  },
]

export function getProductById(id: string): Product | undefined {
  return products.find(product => product.id === id)
}

export function getProductsByCategory(category: "Mujer" | "Hombre"): Product[] {
  return products.filter(product => product.category === category)
}
