import type React from "react"
import Link from "next/link"
import { Clock, FolderKanban, Users, Tag, BarChart3, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "@/app/actions/auth"
import type { Session } from "@/lib/auth"
import type { Workspace } from "@/lib/types"

interface DashboardLayoutProps {
  children: React.ReactNode
  session: Session
  workspace: Workspace
}

export function DashboardLayout({ children, session, workspace }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-xl font-bold">
              Clockify
            </Link>
            <nav className="flex items-center gap-1">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <Clock className="mr-2 h-4 w-4" />
                  Time Tracker
                </Button>
              </Link>
              <Link href="/projects">
                <Button variant="ghost" size="sm">
                  <FolderKanban className="mr-2 h-4 w-4" />
                  Projects
                </Button>
              </Link>
              <Link href="/clients">
                <Button variant="ghost" size="sm">
                  <Users className="mr-2 h-4 w-4" />
                  Clients
                </Button>
              </Link>
              <Link href="/tags">
                <Button variant="ghost" size="sm">
                  <Tag className="mr-2 h-4 w-4" />
                  Tags
                </Button>
              </Link>
              <Link href="/reports">
                <Button variant="ghost" size="sm">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Reports
                </Button>
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{workspace.name}</span>
            <span className="text-sm text-muted-foreground">{session.email}</span>
            <form action={signOut}>
              <Button variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
