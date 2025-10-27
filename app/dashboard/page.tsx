import { requireAuth } from "@/lib/session"
import { db } from "@/lib/db"
import { TimerWidget } from "@/components/timer-widget"
import { TimeEntriesList } from "@/components/time-entries-list"
import { ManualEntryDialog } from "@/components/manual-entry-dialog"
import { DashboardLayout } from "@/components/dashboard-layout"

export default async function DashboardPage() {
  const session = await requireAuth()

  const workspaces = await db.getWorkspacesByUserId(session.userId)
  const currentWorkspace = workspaces[0]

  if (!currentWorkspace) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>No workspace found. Please contact support.</p>
      </div>
    )
  }

  const activeEntry = await db.getActiveTimeEntry(session.userId, currentWorkspace.id)
  const timeEntries = await db.getTimeEntriesByUser(session.userId, currentWorkspace.id)
  const projects = await db.getProjectsByWorkspace(currentWorkspace.id)

  return (
    <DashboardLayout session={session} workspace={currentWorkspace}>
      <div className="space-y-8">
        <div>
          <TimerWidget workspaceId={currentWorkspace.id} activeEntry={activeEntry} projects={projects} />
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Time Entries</h2>
          <ManualEntryDialog workspaceId={currentWorkspace.id} projects={projects} />
        </div>

        <TimeEntriesList entries={timeEntries} />
      </div>
    </DashboardLayout>
  )
}
