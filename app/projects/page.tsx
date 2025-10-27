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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Projects</h1>
          <CreateProjectDialog workspaceId={currentWorkspace.id} clients={clients} />
        </div>

        <ProjectsList projects={projects} clients={clients} />
      </div>
    </DashboardLayout>
  )
}
