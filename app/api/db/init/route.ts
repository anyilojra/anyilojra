import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { sql } = await import("drizzle-orm")
    const { db } = await import("@/lib/db/client")

    // Create all required tables
    const statements = [
      `CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        category TEXT NOT NULL,
        image TEXT NOT NULL,
        description TEXT NOT NULL,
        sizes TEXT[],
        colors TEXT[],
        stock INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        short_id TEXT NOT NULL UNIQUE,
        "userId" TEXT,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        shipping_address TEXT NOT NULL,
        shipping_city TEXT NOT NULL,
        shipping_department TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        payment_phone TEXT,
        total INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id TEXT NOT NULL REFERENCES products(id),
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        size TEXT,
        color TEXT,
        price INTEGER NOT NULL,
        product_image TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS order_payments (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        amount INTEGER NOT NULL,
        payment_method TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        transaction_id TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS returns (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        refund_amount INTEGER,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        "userId" TEXT,
        rating INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        approved BOOLEAN DEFAULT FALSE,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS discount_codes (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL,
        value INTEGER NOT NULL,
        max_uses INTEGER,
        current_uses INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT TRUE,
        expires_at TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        subscribed BOOLEAN DEFAULT TRUE,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )`,

      `CREATE TABLE IF NOT EXISTS contact_messages (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'new',
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )`,
    ]

    for (const stmt of statements) {
      try {
        await db.execute(sql.raw(stmt))
      } catch (err: any) {
        // Ignore "already exists" errors
        if (!err.message.includes("already exists")) {
          console.log("[v0] Table creation error (non-critical):", err.message)
        }
      }
    }

    return NextResponse.json({ success: true, initialized: true })
  } catch (error: any) {
    console.error("[v0] DB initialization error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
