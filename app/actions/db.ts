'use server'

import { createOrder, getOrders, getOrderById, updateOrderStatus, getOrderByShortId } from '@/lib/db/orders'
import { createReturn, getReturns, updateReturnStatus, getReturnsByOrderId } from '@/lib/db/returns'
import { validateDiscountCode, incrementDiscountUsage, getDiscountCodes } from '@/lib/db/discounts'
import { subscribeNewsletter, unsubscribeNewsletter, getSubscribers } from '@/lib/db/newsletter'
import { createReview, getProductReviews, getApprovedReviews } from '@/lib/db/reviews'
import { getProducts, getProductById, getProductsByCategory, createProduct, updateProduct, decreaseProductStock } from '@/lib/db/products'

// Orders
export async function serverCreateOrder(orderData: any, items: any) {
  return await createOrder(orderData, items)
}

export async function serverGetOrders(limit = 50, offset = 0) {
  return await getOrders(limit, offset)
}

export async function serverGetOrderById(orderId: string) {
  return await getOrderById(orderId)
}

export async function serverUpdateOrderStatus(orderId: string, status: string) {
  return await updateOrderStatus(orderId, status)
}

export async function serverGetOrderByShortId(shortId: string) {
  return await getOrderByShortId(shortId)
}

// Returns
export async function serverCreateReturn(returnData: any) {
  return await createReturn(returnData)
}

export async function serverGetReturns(limit = 50, offset = 0) {
  return await getReturns(limit, offset)
}

export async function serverUpdateReturnStatus(returnId: string, status: string, refund_amount?: number) {
  return await updateReturnStatus(returnId, status, refund_amount)
}

export async function serverGetReturnsByOrderId(orderId: string) {
  return await getReturnsByOrderId(orderId)
}

// Products
export async function serverGetProducts(limit = 50, offset = 0) {
  return await getProducts(limit, offset)
}

export async function serverGetProductById(productId: string) {
  return await getProductById(productId)
}

export async function serverGetProductsByCategory(category: string, limit = 50, offset = 0) {
  return await getProductsByCategory(category, limit, offset)
}

export async function serverCreateProduct(productData: any) {
  return await createProduct(productData)
}

export async function serverUpdateProduct(productId: string, updates: any) {
  return await updateProduct(productId, updates)
}

export async function serverDecreaseProductStock(productId: string, quantity: number) {
  return await decreaseProductStock(productId, quantity)
}

// Discounts
export async function serverValidateDiscountCode(code: string) {
  return await validateDiscountCode(code)
}

export async function serverIncrementDiscountUsage(discountId: string) {
  return await incrementDiscountUsage(discountId)
}

export async function serverGetDiscountCodes(limit = 50, offset = 0) {
  return await getDiscountCodes(limit, offset)
}

// Newsletter
export async function serverSubscribeNewsletter(email: string) {
  return await subscribeNewsletter(email)
}

export async function serverUnsubscribeNewsletter(email: string) {
  return await unsubscribeNewsletter(email)
}

export async function serverGetSubscribers(limit = 100, offset = 0) {
  return await getSubscribers(limit, offset)
}

// Reviews
export async function serverCreateReview(reviewData: any) {
  return await createReview(reviewData)
}

export async function serverGetProductReviews(productId: string, limit = 10, offset = 0) {
  return await getProductReviews(productId, limit, offset)
}

export async function serverGetApprovedReviews(productId: string, limit = 10) {
  return await getApprovedReviews(productId, limit)
}
