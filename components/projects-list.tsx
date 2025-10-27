"use client"

import { useState } from "react"
import { Trash2, Archive, FolderKanban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { archiveProject, deleteProject } from "@/app/actions/projects"
import type { Project, Client } from "@/lib/types"

interface ProjectsListProps {
  projects: Project[]
  clients: Client[]
}

export function ProjectsList({ projects, clients }: ProjectsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleArchive(id: string) {
    if (!confirm("Are you sure you want to archive this project?")) {
      return
    }

    const result = await archiveProject(id)

    if (result.error) {
      alert(result.error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this project? This will also delete all associated tasks.")) {
      return
    }

    setDeletingId(id)
    const result = await deleteProject(id)

    if (result.error) {
      alert(result.error)
    }

    setDeletingId(null)
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FolderKanban className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">No projects yet</p>
          <p className="text-sm text-muted-foreground">Create your first project to get started</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="h-10 w-1 rounded-full" style={{ backgroundColor: project.color }} />
                <div>
                  <h3 className="font-semibold">{project.name}</h3>
                  {project.client_name && <p className="text-sm text-muted-foreground">{project.client_name}</p>}
                  <div className="mt-2 flex gap-2">
                    {project.billable && (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700 dark:bg-green-900 dark:text-green-300">
                        Billable
                      </span>
                    )}
                    {project.is_public && (
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        Public
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleArchive(project.id)}>
                  <Archive className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(project.id)}
                  disabled={deletingId === project.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
