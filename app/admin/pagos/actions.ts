"use server"

import { getPendingOrders, updateOrderStatus } from "@/lib/db/orders"

export async function serverGetPendingOrders() {
  return await getPendingOrders()
}

export async function serverUpdateOrderStatus(orderId: string, status: string) {
  return await updateOrderStatus(orderId, status)
}
