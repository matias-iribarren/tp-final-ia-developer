"use client"

import { useState, useEffect } from "react"
import { Calendar, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getReport, exportToCSV } from "@/app/actions/reports"
import { formatDuration } from "@/lib/reports"
import type { ReportSummary, TimeEntry } from "@/lib/types"

interface ReportsViewProps {
  workspaceId: string
}

export function ReportsView({ workspaceId }: ReportsViewProps) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [entries, setEntries] = useState<TimeEntry[]>([])

  // Set default dates (current week)
  useEffect(() => {
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - today.getDay() + 1)

    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    setStartDate(monday.toISOString().split("T")[0])
    setEndDate(sunday.toISOString().split("T")[0])
  }, [])

  async function handleGenerateReport() {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates")
      return
    }

    setIsLoading(true)

    const result = await getReport(workspaceId, startDate, endDate)

    if (result.error) {
      alert(result.error)
    } else if (result.report) {
      setSummary(result.report.summary)
      setEntries(result.report.entries)
    }

    setIsLoading(false)
  }

  async function handleExportCSV() {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates")
      return
    }

    setIsExporting(true)

    const result = await exportToCSV(workspaceId, startDate, endDate)

    if (result.error) {
      alert(result.error)
    } else if (result.csv) {
      // Create download link
      const blob = new Blob([result.csv], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `time-report-${startDate}-to-${endDate}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }

    setIsExporting(false)
  }

  // Auto-generate report when dates change
  useEffect(() => {
    if (startDate && endDate) {
      handleGenerateReport()
    }
  }, [startDate, endDate])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button onClick={handleExportCSV} disabled={isExporting || !summary}>
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && summary && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatDuration(summary.totalDuration)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Billable Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatDuration(summary.billableDuration)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Non-Billable Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatDuration(summary.nonBillableDuration)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalEntries}</div>
              </CardContent>
            </Card>
          </div>

          {summary.projectBreakdown.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Time by Project</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {summary.projectBreakdown.map((project) => (
                    <div key={project.projectId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-4 w-1 rounded-full" style={{ backgroundColor: project.projectColor }} />
                          <span className="font-medium">{project.projectName}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">{project.percentage.toFixed(1)}%</span>
                          <span className="font-semibold">{formatDuration(project.duration)}</span>
                        </div>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${project.percentage}%`,
                            backgroundColor: project.projectColor,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {entries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Time Entries ({entries.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {entries.slice(0, 10).map((entry) => {
                    const duration =
                      entry.end_time &&
                      Math.floor((new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()) / 1000)

                    return (
                      <div key={entry.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-3">
                          {entry.project_id && (
                            <div
                              className="h-4 w-1 rounded-full"
                              style={{ backgroundColor: entry.project_color || "#4CAF50" }}
                            />
                          )}
                          <div>
                            <p className="font-medium">{entry.description || "No description"}</p>
                            <p className="text-sm text-muted-foreground">
                              {entry.project_name && <span>{entry.project_name}</span>}
                              {entry.task_name && (
                                <>
                                  {" • "}
                                  <span>{entry.task_name}</span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-semibold">{duration ? formatDuration(duration) : "0m"}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(entry.start_time).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  {entries.length > 10 && (
                    <p className="pt-2 text-center text-sm text-muted-foreground">
                      Showing 10 of {entries.length} entries. Export to CSV to see all.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {entries.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium">No time entries found</p>
                <p className="text-sm text-muted-foreground">Try selecting a different date range</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
