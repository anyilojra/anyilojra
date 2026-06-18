"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronLeft, Mail, Loader2, Trash2 } from "lucide-react"
import { getContactMessages, deleteContactMessage, updateMessageStatus } from "@/lib/db/messages"

type Message = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: string
  createdAt: Date | string | null
}

export default function AdminMensajesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMessages = async () => {
    setLoading(true)
    const result = await getContactMessages()
    setMessages(result.messages as Message[])
    setLoading(false)
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const handleDelete = async (id: string) => {
    await deleteContactMessage(id)
    setMessages((prev) => prev.filter((m) => m.id !== id))
  }

  const handleMarkRead = async (id: string) => {
    await updateMessageStatus(id, "read")
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "read" } : m))
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="p-2 hover:bg-muted rounded-lg transition">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="font-sans text-2xl md:text-3xl font-bold text-foreground">Mensajes</h1>
            <p className="text-sm text-muted-foreground font-serif mt-1">Contacto de clientes</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <Mail className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-serif">No hay mensajes aún.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`bg-card border rounded-lg p-6 ${
                  msg.status === "new" ? "border-primary/50" : "border-border"
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-sans font-semibold text-foreground">{msg.name}</p>
                      {msg.status === "new" && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-serif">
                          Nuevo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-serif">{msg.email}</p>
                    <p className="font-sans font-medium text-foreground mt-2">{msg.subject}</p>
                    <p className="text-sm text-muted-foreground font-serif mt-1 whitespace-pre-wrap">{msg.message}</p>
                    <p className="text-xs text-muted-foreground font-serif mt-3">
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleDateString("es-CO", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Sin fecha"}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {msg.status === "new" && (
                      <button
                        onClick={() => handleMarkRead(msg.id)}
                        className="text-xs px-3 py-1 border border-border rounded-sm hover:bg-muted transition font-serif"
                      >
                        Marcar leído
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="p-1.5 text-muted-foreground hover:text-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}