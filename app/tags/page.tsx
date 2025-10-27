import { requireAuth } from "@/lib/session"
import { db } from "@/lib/db"
import { TagsList } from "@/components/tags-list"
import { CreateTagDialog } from "@/components/create-tag-dialog"
import { DashboardLayout } from "@/components/dashboard-layout"

export default async function TagsPage() {
  const session = await requireAuth()

  const workspaces = await db.getWorkspacesByUserId(session.userId)
  const currentWorkspace = workspaces[0]

  if (!currentWorkspace) {
    return <div>No workspace found</div>
  }

  const tags = await db.getTagsByWorkspace(currentWorkspace.id)

  return (
    <DashboardLayout session={session} workspace={currentWorkspace}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Tags</h1>
          <CreateTagDialog workspaceId={currentWorkspace.id} />
        </div>

        <TagsList tags={tags} />
      </div>
    </DashboardLayout>
  )
}
