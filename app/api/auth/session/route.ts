import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const headersList = await headers()
    const session = await auth.api.getSession({ headers: headersList })
    if (!session?.user) {
      return NextResponse.json({ session: null, authenticated: false })
    }
    return NextResponse.json({ session, authenticated: true })
  } catch (error) {
    console.error("[v0] Error getting session:", error)
    return NextResponse.json({ session: null, authenticated: false })
  }
}
