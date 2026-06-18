import { pgTable, text, timestamp, boolean, integer, decimal, json } from 'drizzle-orm/pg-core'
import type { InferSelectModel } from 'drizzle-orm'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables ------------------------------------------------------------
// Products table for Nevada - Chaquetas y Ovejeras

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  category: text('category').notNull(),
  image: text('image').notNull(),
  description: text('description').notNull(),
  sizes: text('sizes').array().default([]),
  colors: text('colors').array().default([]),
  stock: integer('stock').notNull().default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// --- Orders tables --------------------------------------------------------
export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  short_id: text('short_id').notNull().unique(),
  userId: text('userId').references(() => user.id, { onDelete: 'set null' }),
  customer_name: text('customer_name').notNull(),
  customer_email: text('customer_email').notNull(),
  customer_phone: text('customer_phone').notNull(),
  shipping_address: text('shipping_address').notNull(),
  shipping_city: text('shipping_city').notNull(),
  shipping_department: text('shipping_department').notNull(),
  payment_method: text('payment_method').notNull(), // 'nequi', 'transfer', etc
  payment_phone: text('payment_phone'),
  total: integer('total').notNull(),
  status: text('status').notNull().default('pending'), // pending, confirmed, shipped, delivered, cancelled
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const order_items = pgTable('order_items', {
  id: text('id').primaryKey(),
  order_id: text('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  product_id: text('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'restrict' }),
  product_name: text('product_name').notNull(),
  quantity: integer('quantity').notNull(),
  size: text('size'),
  color: text('color'),
  price: integer('price').notNull(),
  product_image: text('product_image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const order_payments = pgTable('order_payments', {
  id: text('id').primaryKey(),
  order_id: text('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  payment_method: text('payment_method').notNull(),
  status: text('status').notNull().default('pending'), // pending, completed, failed
  transaction_id: text('transaction_id'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// --- Returns/Devoluciones -------------------------------------------------
export const returns = pgTable('returns', {
  id: text('id').primaryKey(),
  order_id: text('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  reason: text('reason').notNull(),
  status: text('status').notNull().default('pending'), // pending, approved, shipped_back, completed, rejected
  notes: text('notes'),
  refund_amount: integer('refund_amount'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// --- Reviews ---------------------------------------------------------------
export const reviews = pgTable('reviews', {
  id: text('id').primaryKey(),
  product_id: text('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  userId: text('userId').references(() => user.id, { onDelete: 'set null' }),
  rating: integer('rating').notNull(), // 1-5
  title: text('title').notNull(),
  content: text('content').notNull(),
  approved: boolean('approved').notNull().default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// --- Discount Codes --------------------------------------------------------
export const discount_codes = pgTable('discount_codes', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  type: text('type').notNull(), // 'percentage', 'fixed', 'first_purchase'
  value: integer('value').notNull(), // percentage value or fixed amount in cents
  max_uses: integer('max_uses'),
  current_uses: integer('current_uses').notNull().default(0),
  active: boolean('active').notNull().default(true),
  expires_at: timestamp('expires_at'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// --- Newsletter Subscribers ------------------------------------------------
export const newsletter_subscribers = pgTable('newsletter_subscribers', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  subscribed: boolean('subscribed').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// --- Contact Messages (Contacto) -------------------------------------------
export const contact_messages = pgTable('contact_messages', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  status: text('status').notNull().default('new'), // new, read, responded
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// --- Type exports ----------------------------------------------------------
export type Order = InferSelectModel<typeof orders>
export type OrderItem = InferSelectModel<typeof order_items>
export type Product = InferSelectModel<typeof products>
export type ContactMessage = InferSelectModel<typeof contact_messages>
