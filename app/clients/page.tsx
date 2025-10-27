import { requireAuth } from "@/lib/session"
import { db } from "@/lib/db"
import { ClientsList } from "@/components/clients-list"
import { CreateClientDialog } from "@/components/create-client-dialog"
import { DashboardLayout } from "@/components/dashboard-layout"

export default async function ClientsPage() {
  const session = await requireAuth()

  const workspaces = await db.getWorkspacesByUserId(session.userId)
  const currentWorkspace = workspaces[0]

  if (!currentWorkspace) {
    return <div>No workspace found</div>
  }

  const clients = await db.getClientsByWorkspace(currentWorkspace.id)

  return (
    <DashboardLayout session={session} workspace={currentWorkspace}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Clients</h1>
          <CreateClientDialog workspaceId={currentWorkspace.id} />
        </div>

        <ClientsList clients={clients} />
      </div>
    </DashboardLayout>
  )
}
