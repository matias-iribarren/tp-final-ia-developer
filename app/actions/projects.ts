"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/session"

export async function createProject(formData: FormData) {
  const session = await requireAuth()
  const workspaceId = formData.get("workspaceId") as string
  const name = formData.get("name") as string
  const clientId = formData.get("clientId") as string | null
  const color = formData.get("color") as string
  const billable = formData.get("billable") === "true"

  if (!workspaceId || !name) {
    return { error: "Workspace and project name are required" }
  }

  try {
    const project = await db.createProject({
      workspaceId,
      name,
      clientId: clientId && clientId !== "none" ? clientId : undefined,
      color: color || "#4CAF50",
      billable,
    })

    revalidatePath("/dashboard")
    revalidatePath("/projects")
    return { success: true, project }
  } catch (error) {
    console.error("[v0] Create project error:", error)
    return { error: "Failed to create project" }
  }
}

export async function updateProject(projectId: string, formData: FormData) {
  const session = await requireAuth()
  const name = formData.get("name") as string
  const clientId = formData.get("clientId") as string | null
  const color = formData.get("color") as string
  const billable = formData.get("billable") === "true"

  if (!name) {
    return { error: "Project name is required" }
  }

  try {
    await db.sql`
      UPDATE clockify.projects
      SET 
        name = ${name},
        client_id = ${clientId && clientId !== "none" ? clientId : null},
        color = ${color},
        billable = ${billable}
      WHERE id = ${projectId}
    `

    revalidatePath("/dashboard")
    revalidatePath("/projects")
    return { success: true }
  } catch (error) {
    console.error("[v0] Update project error:", error)
    return { error: "Failed to update project" }
  }
}

export async function archiveProject(projectId: string) {
  const session = await requireAuth()

  try {
    await db.sql`
      UPDATE clockify.projects
      SET archived = true
      WHERE id = ${projectId}
    `

    revalidatePath("/dashboard")
    revalidatePath("/projects")
    return { success: true }
  } catch (error) {
    console.error("[v0] Archive project error:", error)
    return { error: "Failed to archive project" }
  }
}

export async function deleteProject(projectId: string) {
  const session = await requireAuth()

  try {
    await db.sql`
      DELETE FROM clockify.projects
      WHERE id = ${projectId}
    `

    revalidatePath("/dashboard")
    revalidatePath("/projects")
    return { success: true }
  } catch (error) {
    console.error("[v0] Delete project error:", error)
    return { error: "Failed to delete project" }
  }
}
