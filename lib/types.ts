export interface User {
  id: string
  email: string
  name: string
  created_at: string
  updated_at: string
}

export interface Workspace {
  id: string
  name: string
  owner_id: string
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  role: "owner" | "admin" | "member"
  hourly_rate?: number
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  workspace_id: string
  name: string
  email?: string
  address?: string
  archived: boolean
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  workspace_id: string
  client_id?: string
  name: string
  color: string
  is_public: boolean
  billable: boolean
  archived: boolean
  created_at: string
  updated_at: string
  client_name?: string
}

export interface Task {
  id: string
  project_id: string
  name: string
  status: "active" | "done"
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  workspace_id: string
  name: string
  archived: boolean
  created_at: string
  updated_at: string
}

export interface TimeEntry {
  id: string
  workspace_id: string
  user_id: string
  project_id?: string
  task_id?: string
  description?: string
  start_time: string
  end_time?: string
  billable: boolean
  created_at: string
  updated_at: string
  project_name?: string
  project_color?: string
  task_name?: string
  client_name?: string
}

export interface TimeEntryWithDuration extends TimeEntry {
  duration: number // in seconds
}

export interface ReportSummary {
  totalDuration: number
  billableDuration: number
  nonBillableDuration: number
  totalEntries: number
  projectBreakdown: Array<{
    projectId: string
    projectName: string
    projectColor: string
    duration: number
    percentage: number
  }>
}

export interface TimeEntryPayload {
  workspace_id: string
  user_id: string
  project_id?: string
  description?: string
  start_time: string
  end_time?: string
  billable?: boolean
  tag_ids?: string[]
}

