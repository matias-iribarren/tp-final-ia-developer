import { requireAuth } from "@/lib/session"
import { db } from "@/lib/db"
import { TimerWidget } from "@/components/timer-widget"
import { TimeEntriesList } from "@/components/time-entries-list"
import { ManualEntryDialog } from "@/components/manual-entry-dialog"
import type { Task, Workspace, TimeEntry, Project } from "@/lib/types"
import { DashboardLayout } from "@/components/dashboard-layout"

export default async function DashboardPage() {
  const session = await requireAuth()

  const workspaces = (await db.getWorkspacesByUserId(session.userId)) as unknown as Workspace[]
  const currentWorkspace = workspaces[0]

  if (!currentWorkspace) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>No workspace found. Please contact support.</p>
      </div>
    )
  }

  const activeEntry = (await db.getActiveTimeEntry(session.userId, currentWorkspace.id)) as unknown as TimeEntry | null
  const timeEntries = (await db.getTimeEntriesByUser(session.userId, currentWorkspace.id)) as unknown as TimeEntry[]
  const projects = (await db.getProjectsByWorkspace(currentWorkspace.id)) as unknown as Project[]
  const tasksArrays = (await Promise.all(projects.map((p) => db.getTasksByProject(p.id)))) as unknown as Task[][]
  const tasksByProject = projects.reduce<Record<string, Task[]>>((acc, project, idx) => {
    acc[project.id] = tasksArrays[idx]
    return acc
  }, {})

  return (
    <DashboardLayout session={session} workspace={currentWorkspace}>
      <div className="space-y-6 md:space-y-8">
        <div>
          <TimerWidget
            workspaceId={currentWorkspace.id}
            activeEntry={activeEntry}
            projects={projects}
            tasksByProject={tasksByProject}
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold">Time Entries</h2>
          <ManualEntryDialog workspaceId={currentWorkspace.id} projects={projects} tasksByProject={tasksByProject} />
        </div>

        <TimeEntriesList entries={timeEntries} />
      </div>
    </DashboardLayout>
  )
}
