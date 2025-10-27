"use client"

import { useState } from "react"
import { Trash2, Edit, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { deleteTimeEntry } from "@/app/actions/time-entries"
import type { TimeEntry } from "@/lib/types"

interface TimeEntriesListProps {
  entries: TimeEntry[]
}

export function TimeEntriesList({ entries }: TimeEntriesListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this time entry?")) {
      return
    }

    setDeletingId(id)
    const result = await deleteTimeEntry(id)

    if (result.error) {
      alert(result.error)
    }

    setDeletingId(null)
  }

  function formatDuration(startTime: string, endTime?: string): string {
    const start = new Date(startTime).getTime()
    const end = endTime ? new Date(endTime).getTime() : Date.now()
    const durationSeconds = Math.floor((end - start) / 1000)

    const hours = Math.floor(durationSeconds / 3600)
    const minutes = Math.floor((durationSeconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  function formatTime(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    })
  }

  // Group entries by date
  const groupedEntries = entries.reduce(
    (groups, entry) => {
      const date = formatDate(entry.start_time)
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(entry)
      return groups
    },
    {} as Record<string, TimeEntry[]>,
  )

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Clock className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">No time entries yet</p>
          <p className="text-sm text-muted-foreground">Start tracking your time to see entries here</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedEntries).map(([date, dateEntries]) => (
        <Card key={date}>
          <CardHeader>
            <CardTitle className="text-lg">{date}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {dateEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50">
                <div className="flex flex-1 items-center gap-4">
                  {entry.project_id && (
                    <div
                      className="h-4 w-1 rounded-full"
                      style={{ backgroundColor: entry.project_color || "#4CAF50" }}
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{entry.description || "No description"}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {entry.project_name && (
                        <>
                          <span>{entry.project_name}</span>
                          {entry.task_name && <span>•</span>}
                        </>
                      )}
                      {entry.task_name && <span>{entry.task_name}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-mono font-semibold">{formatDuration(entry.start_time, entry.end_time)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(entry.start_time)} - {entry.end_time ? formatTime(entry.end_time) : "Running"}
                    </p>
                  </div>

                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" disabled>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingId === entry.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
