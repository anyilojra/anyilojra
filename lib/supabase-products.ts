import { createClient } from "@/utils/supabase/client"

export interface Product {
  id: string
  name: string
  price: number
  cost_price?: number       // ✅ NUEVO: precio de costo para calcular margen
  supplier?: string         // ✅ NUEVO: proveedor asociado al producto
  category: "Mujer" | "Hombre" | "Accesorios"
  image: string
  images?: string[]
  description: string
  sizes: string[]
  colors: string[]
  stock: number
  created_at?: string
}

export async function getProducts(): Promise<Product[]> {
  const supabase = createClient()
  
  if (!supabase) {
    console.error("Supabase client not initialized - missing env vars")
    return []
  }
  
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error.message)
    return []
  }

  return data || []
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = createClient()
  
  if (!supabase) {
    console.error("Supabase client not initialized - missing env vars")
    return null
  }
  
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching product:", error.message)
    return null
  }

  return data
}

export async function getProductsByCategory(category: "Mujer" | "Hombre" | "Accesorios"): Promise<Product[]> {
  const supabase = createClient()
  
  if (!supabase) {
    console.error("Supabase client not initialized - missing env vars")
    return []
  }
  
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products by category:", error.message)
    return []
  }

  return data || []
}

export async function addProduct(product: Omit<Product, "id" | "created_at">): Promise<Product | null> {
  const supabase = createClient()
  
  if (!supabase) {
    console.error("Supabase client not initialized - missing env vars")
    return null
  }
  
  const { data, error } = await supabase
    .from("products")
    .insert([product])
    .select()
    .single()

  if (error) {
    console.error("Error adding product:", error.message)
    return null
  }

  return data
}

export async function updateProduct(id: string, product: Partial<Omit<Product, "id" | "created_at">>): Promise<Product | null> {
  const supabase = createClient()
  
  if (!supabase) {
    console.error("Supabase client not initialized - missing env vars")
    return null
  }
  
  const { data, error } = await supabase
    .from("products")
    .update(product)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating product:", error.message)
    return null
  }

  return data
}

export async function deleteProduct(id: string): Promise<boolean> {
  const supabase = createClient()
  
  if (!supabase) {
    console.error("Supabase client not initialized - missing env vars")
    return false
  }
  
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting product:", error.message)
    return false
  }

  return true
}

export async function decreaseProductStock(productId: string, quantity: number): Promise<boolean> {
  const supabase = createClient()
  
  if (!supabase) {
    console.error("Supabase client not initialized - missing env vars")
    return false
  }

  // First get current stock
  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("stock")
    .eq("id", productId)
    .single()

  if (fetchError || !product) {
    console.error("Error fetching product stock:", fetchError?.message)
    return false
  }

  const newStock = Math.max(0, product.stock - quantity)

  const { error } = await supabase
    .from("products")
    .update({ stock: newStock })
    .eq("id", productId)

  if (error) {
    console.error("Error decreasing stock:", error.message)
    return false
  }

  return true
}
