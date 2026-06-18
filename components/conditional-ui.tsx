"use client"

import { usePathname } from "next/navigation"
import { WhatsAppButton } from "@/components/whatsapp-button"

export function ConditionalUI() {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")

  if (isAdmin) return null

  return (
    <>
      <WhatsAppButton />
    </>
  )
}
