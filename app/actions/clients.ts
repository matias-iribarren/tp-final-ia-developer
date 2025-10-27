"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/session"

export async function createClient(formData: FormData) {
  const session = await requireAuth()
  const workspaceId = formData.get("workspaceId") as string
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const address = formData.get("address") as string

  if (!workspaceId || !name) {
    return { error: "Workspace and client name are required" }
  }

  try {
    const client = await db.createClient({
      workspaceId,
      name,
      email: email || undefined,
      address: address || undefined,
    })

    revalidatePath("/clients")
    revalidatePath("/projects")
    return { success: true, client }
  } catch (error) {
    console.error("[v0] Create client error:", error)
    return { error: "Failed to create client" }
  }
}

export async function updateClient(clientId: string, formData: FormData) {
  const session = await requireAuth()
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const address = formData.get("address") as string

  if (!name) {
    return { error: "Client name is required" }
  }

  try {
    await db.sql`
      UPDATE clockify.clients
      SET 
        name = ${name},
        email = ${email || null},
        address = ${address || null}
      WHERE id = ${clientId}
    `

    revalidatePath("/clients")
    revalidatePath("/projects")
    return { success: true }
  } catch (error) {
    console.error("[v0] Update client error:", error)
    return { error: "Failed to update client" }
  }
}

export async function archiveClient(clientId: string) {
  const session = await requireAuth()

  try {
    await db.sql`
      UPDATE clockify.clients
      SET archived = true
      WHERE id = ${clientId}
    `

    revalidatePath("/clients")
    return { success: true }
  } catch (error) {
    console.error("[v0] Archive client error:", error)
    return { error: "Failed to archive client" }
  }
}

export async function deleteClient(clientId: string) {
  const session = await requireAuth()

  try {
    await db.sql`
      DELETE FROM clockify.clients
      WHERE id = ${clientId}
    `

    revalidatePath("/clients")
    revalidatePath("/projects")
    return { success: true }
  } catch (error) {
    console.error("[v0] Delete client error:", error)
    return { error: "Failed to delete client" }
  }
}
