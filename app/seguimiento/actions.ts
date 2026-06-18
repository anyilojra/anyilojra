"use server"

import { getOrderByShortId } from "@/lib/db/orders"
import type { Order } from "@/lib/db/schema"

export async function serverGetOrderByShortId(shortId: string): Promise<{ order: (Order & { items: any[] }) | null; error: string | null }> {
  return await getOrderByShortId(shortId)
}
