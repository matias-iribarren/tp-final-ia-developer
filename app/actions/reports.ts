"use server"

import { requireAuth } from "@/lib/session"
import { generateReport, generateCSV } from "@/lib/reports"

export async function getReport(workspaceId: string, startDate: string, endDate: string) {
  const session = await requireAuth()

  try {
    const start = new Date(startDate)
    const end = new Date(endDate)

    const report = await generateReport(session.userId, workspaceId, start, end)

    return { success: true, report }
  } catch (error) {
    console.error("[v0] Get report error:", error)
    return { error: "Failed to generate report" }
  }
}

export async function exportToCSV(workspaceId: string, startDate: string, endDate: string) {
  const session = await requireAuth()

  try {
    const start = new Date(startDate)
    const end = new Date(endDate)

    const { entries } = await generateReport(session.userId, workspaceId, start, end)
    const csv = generateCSV(entries)

    return { success: true, csv }
  } catch (error) {
    console.error("[v0] Export CSV error:", error)
    return { error: "Failed to export CSV" }
  }
}
