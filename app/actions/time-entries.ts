"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/session"

export async function startTimer(formData: FormData) {
  const session = await requireAuth()
  const workspaceId = formData.get("workspaceId") as string
  const projectId = formData.get("projectId") as string | null
  const taskId = formData.get("taskId") as string | null
  const description = formData.get("description") as string

  if (!workspaceId) {
    return { error: "Workspace is required" }
  }

  try {
    // Check if there's already an active timer
    const activeEntry = await db.getActiveTimeEntry(session.userId, workspaceId)

    if (activeEntry) {
      return { error: "You already have an active timer" }
    }

    // Start new timer
    const timeEntry = await db.startTimeEntry({
      userId: session.userId,
      workspaceId,
      projectId: projectId || undefined,
      taskId: taskId || undefined,
      description: description || undefined,
      billable: true,
    })

    revalidatePath("/dashboard")
    return { success: true, timeEntry }
  } catch (error) {
    console.error("[v0] Start timer error:", error)
    return { error: "Failed to start timer" }
  }
}

export async function stopTimer(timeEntryId: string) {
  const session = await requireAuth()

  try {
    const timeEntry = await db.stopTimeEntry(timeEntryId)

    if (!timeEntry) {
      return { error: "Time entry not found or already stopped" }
    }

    revalidatePath("/dashboard")
    return { success: true, timeEntry }
  } catch (error) {
    console.error("[v0] Stop timer error:", error)
    return { error: "Failed to stop timer" }
  }
}

export async function createManualEntry(formData: FormData) {
  const session = await requireAuth()
  const workspaceId = formData.get("workspaceId") as string
  const projectId = formData.get("projectId") as string | null
  const taskId = formData.get("taskId") as string | null
  const description = formData.get("description") as string
  const startTime = formData.get("startTime") as string
  const endTime = formData.get("endTime") as string
  const billable = formData.get("billable") === "true"

  if (!workspaceId || !startTime || !endTime) {
    return { error: "Workspace, start time, and end time are required" }
  }

  try {
    const start = new Date(startTime)
    const end = new Date(endTime)

    if (end <= start) {
      return { error: "End time must be after start time" }
    }

    const timeEntry = await db.createManualTimeEntry({
      userId: session.userId,
      workspaceId,
      projectId: projectId || undefined,
      taskId: taskId || undefined,
      description: description || undefined,
      startTime: start,
      endTime: end,
      billable,
    })

    revalidatePath("/dashboard")
    return { success: true, timeEntry }
  } catch (error) {
    console.error("[v0] Create manual entry error:", error)
    return { error: "Failed to create time entry" }
  }
}

export async function deleteTimeEntry(timeEntryId: string) {
  const session = await requireAuth()

  try {
    await db.sql`
      DELETE FROM clockify.time_entries
      WHERE id = ${timeEntryId} AND user_id = ${session.userId}
    `

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("[v0] Delete time entry error:", error)
    return { error: "Failed to delete time entry" }
  }
}

export async function updateTimeEntry(timeEntryId: string, formData: FormData) {
  const session = await requireAuth()
  const description = formData.get("description") as string
  const projectId = formData.get("projectId") as string | null
  const taskId = formData.get("taskId") as string | null
  const startTime = formData.get("startTime") as string
  const endTime = formData.get("endTime") as string
  const billable = formData.get("billable") === "true"

  try {
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : null

    if (end && end <= start) {
      return { error: "End time must be after start time" }
    }

    await db.sql`
      UPDATE clockify.time_entries
      SET 
        description = ${description || ""},
        project_id = ${projectId || null},
        task_id = ${taskId || null},
        start_time = ${start.toISOString()},
        end_time = ${end ? end.toISOString() : null},
        billable = ${billable}
      WHERE id = ${timeEntryId} AND user_id = ${session.userId}
    `

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("[v0] Update time entry error:", error)
    return { error: "Failed to update time entry" }
  }
}
