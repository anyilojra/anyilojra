import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const h = await headers()
    await auth.api.signOut({ headers: h })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error signing out:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
