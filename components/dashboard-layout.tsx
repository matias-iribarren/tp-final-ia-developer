"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Clock, FolderKanban, Users, Tag, BarChart3, LogOut, Menu, X } from "lucide-react"
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/dashboard" className="text-xl font-bold">
              Clockify
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
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

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden flex-col items-end md:flex">
              <span className="text-sm font-medium">{workspace.name}</span>
              <span className="text-xs text-muted-foreground">{session.email}</span>
            </div>
            <form action={signOut} className="hidden md:block">
              <Button variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </form>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t bg-background lg:hidden">
            <nav className="container mx-auto flex flex-col px-4 py-4">
              <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Clock className="mr-2 h-4 w-4" />
                  Time Tracker
                </Button>
              </Link>
              <Link href="/projects" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <FolderKanban className="mr-2 h-4 w-4" />
                  Projects
                </Button>
              </Link>
              <Link href="/clients" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Clients
                </Button>
              </Link>
              <Link href="/tags" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Tag className="mr-2 h-4 w-4" />
                  Tags
                </Button>
              </Link>
              <Link href="/reports" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Reports
                </Button>
              </Link>
              <div className="mt-4 border-t pt-4">
                <div className="mb-3 px-3">
                  <p className="text-sm font-medium">{workspace.name}</p>
                  <p className="text-xs text-muted-foreground">{session.email}</p>
                </div>
                <form action={signOut}>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </form>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-4 md:py-8">{children}</main>
    </div>
  )
}
