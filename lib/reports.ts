import { sql } from "./db"
import type { TimeEntry } from "./types"

export interface ReportSummary {
  totalDuration: number
  billableDuration: number
  nonBillableDuration: number
  totalEntries: number
  projectBreakdown: Array<{
    projectId: string
    projectName: string
    projectColor: string
    duration: number
    percentage: number
  }>
}

export async function generateReport(
  userId: string,
  workspaceId: string,
  startDate: Date,
  endDate: Date,
): Promise<{ entries: TimeEntry[]; summary: ReportSummary }> {
  // Get time entries for the date range
  const entries = await sql<TimeEntry[]>`
    SELECT 
      te.*,
      p.name as project_name,
      p.color as project_color,
      t.name as task_name,
      c.name as client_name
    FROM clockify.time_entries te
    LEFT JOIN clockify.projects p ON te.project_id = p.id
    LEFT JOIN clockify.tasks t ON te.task_id = t.id
    LEFT JOIN clockify.clients c ON p.client_id = c.id
    WHERE te.user_id = ${userId}
      AND te.workspace_id = ${workspaceId}
      AND te.start_time >= ${startDate.toISOString()}
      AND te.start_time <= ${endDate.toISOString()}
      AND te.end_time IS NOT NULL
    ORDER BY te.start_time DESC
  `

  // Calculate summary statistics
  let totalDuration = 0
  let billableDuration = 0
  let nonBillableDuration = 0
  const projectDurations = new Map<string, { name: string; color: string; duration: number }>()

  for (const entry of entries) {
    const duration = calculateDuration(entry.start_time, entry.end_time!)
    totalDuration += duration

    if (entry.billable) {
      billableDuration += duration
    } else {
      nonBillableDuration += duration
    }

    // Track project durations
    if (entry.project_id) {
      const existing = projectDurations.get(entry.project_id)
      if (existing) {
        existing.duration += duration
      } else {
        projectDurations.set(entry.project_id, {
          name: entry.project_name || "Unknown",
          color: entry.project_color || "#4CAF50",
          duration,
        })
      }
    }
  }

  // Convert project durations to array with percentages
  const projectBreakdown = Array.from(projectDurations.entries())
    .map(([projectId, data]) => ({
      projectId,
      projectName: data.name,
      projectColor: data.color,
      duration: data.duration,
      percentage: totalDuration > 0 ? (data.duration / totalDuration) * 100 : 0,
    }))
    .sort((a, b) => b.duration - a.duration)

  return {
    entries,
    summary: {
      totalDuration,
      billableDuration,
      nonBillableDuration,
      totalEntries: entries.length,
      projectBreakdown,
    },
  }
}

function calculateDuration(startTime: string, endTime: string): number {
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  return Math.floor((end - start) / 1000) // Duration in seconds
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export function formatDurationDecimal(seconds: number): string {
  const hours = seconds / 3600
  return hours.toFixed(2)
}

export function generateCSV(entries: TimeEntry[]): string {
  const headers = ["Date", "Start Time", "End Time", "Duration", "Project", "Task", "Description", "Billable"]

  const rows = entries.map((entry) => {
    const startDate = new Date(entry.start_time)
    const endDate = entry.end_time ? new Date(entry.end_time) : null
    const duration = endDate ? calculateDuration(entry.start_time, entry.end_time!) : 0

    return [
      startDate.toLocaleDateString(),
      startDate.toLocaleTimeString(),
      endDate ? endDate.toLocaleTimeString() : "",
      formatDurationDecimal(duration),
      entry.project_name || "",
      entry.task_name || "",
      entry.description || "",
      entry.billable ? "Yes" : "No",
    ]
  })

  const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

  return csvContent
}
