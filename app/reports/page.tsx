import { requireAuth } from "@/lib/session"
import { db } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ReportsView } from "@/components/reports-view"

export default async function ReportsPage() {
  const session = await requireAuth()

  const workspaces = await db.getWorkspacesByUserId(session.userId)
  const currentWorkspace = workspaces[0]

  if (!currentWorkspace) {
    return <div>No workspace found</div>
  }

  return (
    <DashboardLayout session={session} workspace={currentWorkspace}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Reports</h1>
        <ReportsView workspaceId={currentWorkspace.id} />
      </div>
    </DashboardLayout>
  )
}
