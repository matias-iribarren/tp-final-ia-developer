# API Documentation

This document describes the server actions and database functions available in the Clockify clone application.

## Authentication

### signUp(formData: FormData)

Creates a new user account and default workspace.

**Parameters:**
- `email` (string) - User's email address
- `password` (string) - User's password (min 6 characters)
- `name` (string) - User's full name

**Returns:**
- `{ error: string }` on failure
- Redirects to `/dashboard` on success

**Example:**
\`\`\`typescript
const formData = new FormData()
formData.append('email', 'user@example.com')
formData.append('password', 'password123')
formData.append('name', 'John Doe')

await signUp(formData)
\`\`\`

### signIn(formData: FormData)

Authenticates a user with email and password.

**Parameters:**
- `email` (string) - User's email address
- `password` (string) - User's password

**Returns:**
- `{ error: string }` on failure
- Redirects to `/dashboard` on success

### signOut()

Signs out the current user and destroys their session.

**Returns:**
- Redirects to `/login`

## Time Entries

### startTimer(formData: FormData)

Starts a new time tracking timer.

**Parameters:**
- `workspaceId` (string) - Workspace ID
- `projectId` (string, optional) - Project ID
- `taskId` (string, optional) - Task ID
- `description` (string, optional) - Entry description

**Returns:**
\`\`\`typescript
{
  success: boolean
  timeEntry?: TimeEntry
  error?: string
}
\`\`\`

### stopTimer(timeEntryId: string)

Stops an active timer.

**Parameters:**
- `timeEntryId` (string) - ID of the time entry to stop

**Returns:**
\`\`\`typescript
{
  success: boolean
  timeEntry?: TimeEntry
  error?: string
}
\`\`\`

### createManualEntry(formData: FormData)

Creates a manual time entry with specific start and end times.

**Parameters:**
- `workspaceId` (string) - Workspace ID
- `projectId` (string, optional) - Project ID
- `taskId` (string, optional) - Task ID
- `description` (string, optional) - Entry description
- `startTime` (string) - ISO datetime string
- `endTime` (string) - ISO datetime string
- `billable` (boolean) - Whether entry is billable

**Returns:**
\`\`\`typescript
{
  success: boolean
  timeEntry?: TimeEntry
  error?: string
}
\`\`\`

### updateTimeEntry(timeEntryId: string, formData: FormData)

Updates an existing time entry.

**Parameters:**
- `timeEntryId` (string) - ID of the time entry
- `description` (string) - Entry description
- `projectId` (string, optional) - Project ID
- `taskId` (string, optional) - Task ID
- `startTime` (string) - ISO datetime string
- `endTime` (string) - ISO datetime string
- `billable` (boolean) - Whether entry is billable

**Returns:**
\`\`\`typescript
{
  success: boolean
  error?: string
}
\`\`\`

### deleteTimeEntry(timeEntryId: string)

Deletes a time entry.

**Parameters:**
- `timeEntryId` (string) - ID of the time entry to delete

**Returns:**
\`\`\`typescript
{
  success: boolean
  error?: string
}
\`\`\`

## Projects

### createProject(formData: FormData)

Creates a new project.

**Parameters:**
- `workspaceId` (string) - Workspace ID
- `name` (string) - Project name
- `clientId` (string, optional) - Client ID
- `color` (string) - Hex color code
- `billable` (boolean) - Whether project is billable by default

**Returns:**
\`\`\`typescript
{
  success: boolean
  project?: Project
  error?: string
}
\`\`\`

### updateProject(projectId: string, formData: FormData)

Updates an existing project.

**Parameters:**
- `projectId` (string) - Project ID
- `name` (string) - Project name
- `clientId` (string, optional) - Client ID
- `color` (string) - Hex color code
- `billable` (boolean) - Whether project is billable by default

**Returns:**
\`\`\`typescript
{
  success: boolean
  error?: string
}
\`\`\`

### archiveProject(projectId: string)

Archives a project (soft delete).

**Parameters:**
- `projectId` (string) - Project ID

**Returns:**
\`\`\`typescript
{
  success: boolean
  error?: string
}
\`\`\`

### deleteProject(projectId: string)

Permanently deletes a project.

**Parameters:**
- `projectId` (string) - Project ID

**Returns:**
\`\`\`typescript
{
  success: boolean
  error?: string
}
\`\`\`

## Clients

### createClient(formData: FormData)

Creates a new client.

**Parameters:**
- `workspaceId` (string) - Workspace ID
- `name` (string) - Client name
- `email` (string, optional) - Client email
- `address` (string, optional) - Client address

**Returns:**
\`\`\`typescript
{
  success: boolean
  client?: Client
  error?: string
}
\`\`\`

### updateClient(clientId: string, formData: FormData)

Updates an existing client.

**Parameters:**
- `clientId` (string) - Client ID
- `name` (string) - Client name
- `email` (string, optional) - Client email
- `address` (string, optional) - Client address

**Returns:**
\`\`\`typescript
{
  success: boolean
  error?: string
}
\`\`\`

### deleteClient(clientId: string)

Deletes a client.

**Parameters:**
- `clientId` (string) - Client ID

**Returns:**
\`\`\`typescript
{
  success: boolean
  error?: string
}
\`\`\`

## Tags

### createTag(formData: FormData)

Creates a new tag.

**Parameters:**
- `workspaceId` (string) - Workspace ID
- `name` (string) - Tag name

**Returns:**
\`\`\`typescript
{
  success: boolean
  tag?: Tag
  error?: string
}
\`\`\`

### deleteTag(tagId: string)

Deletes a tag.

**Parameters:**
- `tagId` (string) - Tag ID

**Returns:**
\`\`\`typescript
{
  success: boolean
  error?: string
}
\`\`\`

## Reports

### getReport(workspaceId: string, startDate: string, endDate: string)

Generates a time tracking report for a date range.

**Parameters:**
- `workspaceId` (string) - Workspace ID
- `startDate` (string) - ISO date string (YYYY-MM-DD)
- `endDate` (string) - ISO date string (YYYY-MM-DD)

**Returns:**
\`\`\`typescript
{
  success: boolean
  report?: {
    entries: TimeEntry[]
    summary: ReportSummary
  }
  error?: string
}
\`\`\`

**ReportSummary Type:**
\`\`\`typescript
{
  totalDuration: number        // Total seconds
  billableDuration: number     // Billable seconds
  nonBillableDuration: number  // Non-billable seconds
  totalEntries: number         // Count of entries
  projectBreakdown: Array<{
    projectId: string
    projectName: string
    projectColor: string
    duration: number           // Seconds
    percentage: number         // Percentage of total
  }>
}
\`\`\`

### exportToCSV(workspaceId: string, startDate: string, endDate: string)

Exports time entries to CSV format.

**Parameters:**
- `workspaceId` (string) - Workspace ID
- `startDate` (string) - ISO date string (YYYY-MM-DD)
- `endDate` (string) - ISO date string (YYYY-MM-DD)

**Returns:**
\`\`\`typescript
{
  success: boolean
  csv?: string  // CSV content
  error?: string
}
\`\`\`

## Database Functions

### db.getWorkspacesByUserId(userId: string)

Retrieves all workspaces for a user.

### db.getProjectsByWorkspace(workspaceId: string)

Retrieves all projects in a workspace.

### db.getTimeEntriesByUser(userId: string, workspaceId: string, startDate?: Date, endDate?: Date)

Retrieves time entries for a user, optionally filtered by date range.

### db.getActiveTimeEntry(userId: string, workspaceId: string)

Retrieves the currently active (running) time entry for a user.

### db.startTimeEntry(data: StartTimeEntryData)

Starts a new time entry.

### db.stopTimeEntry(timeEntryId: string)

Stops a time entry by setting its end time.

### db.createManualTimeEntry(data: ManualTimeEntryData)

Creates a time entry with specific start and end times.

## Types

All TypeScript types are defined in `lib/types.ts`:

- `User`
- `Workspace`
- `WorkspaceMember`
- `Client`
- `Project`
- `Task`
- `Tag`
- `TimeEntry`
- `ReportSummary`
