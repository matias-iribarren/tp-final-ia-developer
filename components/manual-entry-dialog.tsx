"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createManualEntry } from "@/app/actions/time-entries"
import type { Project, Task } from "@/lib/types"

interface ManualEntryDialogProps {
  workspaceId: string
  projects: Project[]
  tasksByProject: Record<string, Task[]>
}

export function ManualEntryDialog({ workspaceId, projects, tasksByProject }: ManualEntryDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [projectId, setProjectId] = useState<string>("none")
  const [taskId, setTaskId] = useState<string>("")

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)

    formData.append("workspaceId", workspaceId)
    if (projectId === "none" || !taskId) {
      alert("Seleccioná un proyecto y una tarea")
      setIsLoading(false)
      return
    }
    formData.append("projectId", projectId)
    formData.append("taskId", taskId)

    const result = await createManualEntry(formData)

    if (result.error) {
      alert(result.error)
      setIsLoading(false)
    } else {
      setOpen(false)
      setProjectId("none")
      setTaskId("")
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Time Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Manual Time Entry</DialogTitle>
            <DialogDescription>Create a time entry for work you've already completed</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder="What did you work on?" disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectId">Project</Label>
              <Select value={projectId} onValueChange={setProjectId} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select a project</SelectItem>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskId">Task</Label>
              <Select
                value={taskId}
                onValueChange={setTaskId}
                disabled={isLoading || projectId === "none"}
              >
                <SelectTrigger>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input id="startTime" name="startTime" type="datetime-local" required disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input id="endTime" name="endTime" type="datetime-local" required disabled={isLoading} />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="billable" name="billable" value="true" defaultChecked />
              <Label htmlFor="billable" className="text-sm font-normal">
                Billable
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
