"use server"

import { db } from './client'
import { contact_messages } from './schema'
import { desc } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function saveContactMessage(data: {
  name: string
  email: string
  subject: string
  message: string
}) {
  try {
    const id = nanoid()
    const result = await db.insert(contact_messages).values({
      id,
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return { success: true, id }
  } catch (error) {
    console.error('[v0] Error saving contact message:', error)
    return { success: false, error: 'Failed to save message' }
  }
}

export async function getContactMessages() {
  try {
    const messages = await db
      .select()
      .from(contact_messages)
      .orderBy(desc(contact_messages.createdAt))
    return { messages, error: null }
  } catch (error) {
    console.error('[v0] Error fetching contact messages:', error)
    return { messages: [], error: 'Failed to fetch messages' }
  }
}

export async function updateMessageStatus(id: string, status: 'new' | 'read' | 'responded') {
  try {
    await db
      .update(contact_messages)
      .set({ status, updatedAt: new Date() })
      .where((t) => t.id === id)
    return { success: true }
  } catch (error) {
    console.error('[v0] Error updating message status:', error)
    return { success: false }
  }
}

export async function deleteContactMessage(id: string) {
  try {
    await db.delete(contact_messages).where((t) => t.id === id)
    return { success: true }
  } catch (error) {
    console.error('[v0] Error deleting message:', error)
    return { success: false }
  }
}
