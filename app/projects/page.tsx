import { requireAuth } from "@/lib/session"
import { db } from "@/lib/db"
import { ProjectsList } from "@/components/projects-list"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { DashboardLayout } from "@/components/dashboard-layout"

export default async function ProjectsPage() {
  const session = await requireAuth()

  const workspaces = await db.getWorkspacesByUserId(session.userId)
  const currentWorkspace = workspaces[0]

  if (!currentWorkspace) {
    return <div>No workspace found</div>
  }

  const projects = await db.getProjectsByWorkspace(currentWorkspace.id)
  const clients = await db.getClientsByWorkspace(currentWorkspace.id)

  return (
    <DashboardLayout session={session} workspace={currentWorkspace}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold md:text-3xl">Projects</h1>
          <CreateProjectDialog workspaceId={currentWorkspace.id} clients={clients} />
        </div>

        <ProjectsList projects={projects} clients={clients} />
      </div>
    </DashboardLayout>
  )
}
