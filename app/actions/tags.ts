"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/session"

export async function createTag(formData: FormData) {
  const session = await requireAuth()
  const workspaceId = formData.get("workspaceId") as string
  const name = formData.get("name") as string

  if (!workspaceId || !name) {
    return { error: "Workspace and tag name are required" }
  }

  try {
    const tag = await db.createTag(workspaceId, name)

    revalidatePath("/tags")
    return { success: true, tag }
  } catch (error) {
    console.error("[v0] Create tag error:", error)
    return { error: "Failed to create tag" }
  }
}

export async function deleteTag(tagId: string) {
  const session = await requireAuth()

  try {
    await db.sql`
      DELETE FROM clockify.tags
      WHERE id = ${tagId}
    `

    revalidatePath("/tags")
    return { success: true }
  } catch (error) {
    console.error("[v0] Delete tag error:", error)
    return { error: "Failed to delete tag" }
  }
}
