"use client"

import { useState, useEffect } from "react"
import { Play, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { startTimer, stopTimer } from "@/app/actions/time-entries"
import type { TimeEntry, Project, Task } from "@/lib/types"

interface TimerWidgetProps {
  workspaceId: string
  activeEntry: TimeEntry | null
  projects: Project[]
  tasksByProject: Record<string, Task[]>
}

export function TimerWidget({ workspaceId, activeEntry, projects, tasksByProject }: TimerWidgetProps) {
  const [description, setDescription] = useState("")
  const [projectId, setProjectId] = useState<string>("none")
  const [taskId, setTaskId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    if (activeEntry) {
      const startTime = new Date(activeEntry.start_time).getTime()

      const updateElapsed = () => {
        const now = Date.now()
        setElapsedTime(Math.floor((now - startTime) / 1000))
      }

      updateElapsed()
      const interval = setInterval(updateElapsed, 1000)

      return () => clearInterval(interval)
    } else {
      setElapsedTime(0)
    }
  }, [activeEntry])

  async function handleStart() {
    setIsLoading(true)

    if (projectId === "none" || !taskId) {
      alert("Seleccioná un proyecto y una tarea para iniciar el temporizador")
      setIsLoading(false)
      return
    }

    const formData = new FormData()
    formData.append("workspaceId", workspaceId)
    formData.append("description", description)
    formData.append("projectId", projectId)
    formData.append("taskId", taskId)

    const result = await startTimer(formData)

    if (result.error) {
      alert(result.error)
    } else {
      setDescription("")
      setProjectId("none")
      setTaskId("")
    }

    setIsLoading(false)
  }

  async function handleStop() {
    if (!activeEntry) return

    setIsLoading(true)
    const result = await stopTimer(activeEntry.id)

    if (result.error) {
      alert(result.error)
    }

    setIsLoading(false)
  }

  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 lg:flex-row lg:items-center">
      <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
        <Input
          placeholder="What are you working on?"
          value={activeEntry ? activeEntry.description || "" : description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={!!activeEntry || isLoading}
          className="flex-1"
        />
        <Select
          value={activeEntry ? activeEntry.project_id || "none" : projectId}
          onValueChange={setProjectId}
          disabled={!!activeEntry || isLoading}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No project</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
                  {project.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={taskId} onValueChange={setTaskId} disabled={!!activeEntry || isLoading || projectId === "none"}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Select task" />
          </SelectTrigger>
          <SelectContent>
            {(projectId !== "none" ? tasksByProject[projectId] || [] : []).map((task) => (
              <SelectItem key={task.id} value={task.id}>
                {task.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between gap-3 lg:justify-end">
        <div className="min-w-[100px] text-center font-mono text-2xl font-semibold">{formatTime(elapsedTime)}</div>
        {activeEntry ? (
          <Button onClick={handleStop} disabled={isLoading} size="lg" variant="destructive">
            <Square className="h-5 w-5" />
          </Button>
        ) : (
          <Button onClick={handleStart} disabled={isLoading} size="lg">
            <Play className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  )
}
