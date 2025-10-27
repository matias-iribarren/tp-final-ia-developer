// Custom Neon SQL client using HTTP API

interface QueryResult {
  rows: any[]
  fields: any[]
  rowCount: number
}

async function executeQuery(query: string, params: any[] = []): Promise<any[]> {
  const connectionString = process.env.NEON_POSTGRES_URL

  if (!connectionString) {
    throw new Error("NEON_POSTGRES_URL environment variable is not set")
  }

  // Parse connection string to get HTTP endpoint
  // Format: postgres://user:pass@host/db
  const url = new URL(connectionString.replace("postgres://", "https://"))
  const [user, password] = url.username && url.password ? [url.username, decodeURIComponent(url.password)] : ["", ""]

  const host = url.hostname
  const database = url.pathname.slice(1)

  // Use Neon's HTTP API
  const httpEndpoint = `https://${host}/sql`

  try {
    const response = await fetch(httpEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${password}`,
      },
      body: JSON.stringify({
        query,
        params,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Database query failed: ${error}`)
    }

    const result: QueryResult = await response.json()
    return result.rows || []
  } catch (error) {
    console.error("[v0] Database query error:", error)
    throw error
  }
}

// SQL template tag function
function sql(strings: TemplateStringsArray, ...values: any[]) {
  let query = ""
  const params: any[] = []

  for (let i = 0; i < strings.length; i++) {
    query += strings[i]
    if (i < values.length) {
      params.push(values[i])
      query += `$${params.length}`
    }
  }

  return executeQuery(query, params)
}

export { sql }

// Database query helpers
export const db = {
  sql, // Export sql for direct queries

  // Workspaces
  async getWorkspacesByUserId(userId: string) {
    return sql`
      SELECT w.* 
      FROM clockify.workspaces w
      LEFT JOIN clockify.workspace_members wm ON w.id = wm.workspace_id
      WHERE w.owner_id = ${userId} OR wm.user_id = ${userId}
      ORDER BY w.created_at DESC
    `
  },

  async getWorkspaceById(workspaceId: string) {
    const result = await sql`
      SELECT * FROM clockify.workspaces 
      WHERE id = ${workspaceId}
    `
    return result[0]
  },

  async createWorkspace(name: string, ownerId: string) {
    const result = await sql`
      INSERT INTO clockify.workspaces (name, owner_id)
      VALUES (${name}, ${ownerId})
      RETURNING *
    `
    return result[0]
  },

  // Projects
  async getProjectsByWorkspace(workspaceId: string) {
    return sql`
      SELECT p.*, c.name as client_name
      FROM clockify.projects p
      LEFT JOIN clockify.clients c ON p.client_id = c.id
      WHERE p.workspace_id = ${workspaceId} AND p.archived = false
      ORDER BY p.name ASC
    `
  },

  async createProject(data: {
    workspaceId: string
    name: string
    clientId?: string
    color?: string
    billable?: boolean
  }) {
    const result = await sql`
      INSERT INTO clockify.projects (workspace_id, name, client_id, color, billable)
      VALUES (${data.workspaceId}, ${data.name}, ${data.clientId || null}, ${data.color || "#4CAF50"}, ${data.billable ?? true})
      RETURNING *
    `
    return result[0]
  },

  // Time Entries
  async getTimeEntriesByUser(userId: string, workspaceId: string, startDate?: Date, endDate?: Date) {
    if (startDate && endDate) {
      return sql`
        SELECT te.*, p.name as project_name, p.color as project_color, t.name as task_name
        FROM clockify.time_entries te
        LEFT JOIN clockify.projects p ON te.project_id = p.id
        LEFT JOIN clockify.tasks t ON te.task_id = t.id
        WHERE te.user_id = ${userId} 
          AND te.workspace_id = ${workspaceId}
          AND te.start_time >= ${startDate.toISOString()}
          AND te.start_time <= ${endDate.toISOString()}
        ORDER BY te.start_time DESC
      `
    }

    return sql`
      SELECT te.*, p.name as project_name, p.color as project_color, t.name as task_name
      FROM clockify.time_entries te
      LEFT JOIN clockify.projects p ON te.project_id = p.id
      LEFT JOIN clockify.tasks t ON te.task_id = t.id
      WHERE te.user_id = ${userId} AND te.workspace_id = ${workspaceId}
      ORDER BY te.start_time DESC
      LIMIT 100
    `
  },

  async getActiveTimeEntry(userId: string, workspaceId: string) {
    const result = await sql`
      SELECT te.*, p.name as project_name, p.color as project_color, t.name as task_name
      FROM clockify.time_entries te
      LEFT JOIN clockify.projects p ON te.project_id = p.id
      LEFT JOIN clockify.tasks t ON te.task_id = t.id
      WHERE te.user_id = ${userId} 
        AND te.workspace_id = ${workspaceId}
        AND te.end_time IS NULL
      ORDER BY te.start_time DESC
      LIMIT 1
    `
    return result[0]
  },

  async startTimeEntry(data: {
    userId: string
    workspaceId: string
    projectId?: string
    taskId?: string
    description?: string
    billable?: boolean
  }) {
    const result = await sql`
      INSERT INTO clockify.time_entries (
        user_id, workspace_id, project_id, task_id, description, start_time, billable
      )
      VALUES (
        ${data.userId}, 
        ${data.workspaceId}, 
        ${data.projectId || null}, 
        ${data.taskId || null}, 
        ${data.description || ""}, 
        NOW(), 
        ${data.billable ?? true}
      )
      RETURNING *
    `
    return result[0]
  },

  async stopTimeEntry(timeEntryId: string) {
    const result = await sql`
      UPDATE clockify.time_entries
      SET end_time = NOW()
      WHERE id = ${timeEntryId} AND end_time IS NULL
      RETURNING *
    `
    return result[0]
  },

  async createManualTimeEntry(data: {
    userId: string
    workspaceId: string
    projectId?: string
    taskId?: string
    description?: string
    startTime: Date
    endTime: Date
    billable?: boolean
  }) {
    const result = await sql`
      INSERT INTO clockify.time_entries (
        user_id, workspace_id, project_id, task_id, description, start_time, end_time, billable
      )
      VALUES (
        ${data.userId}, 
        ${data.workspaceId}, 
        ${data.projectId || null}, 
        ${data.taskId || null}, 
        ${data.description || ""}, 
        ${data.startTime.toISOString()}, 
        ${data.endTime.toISOString()}, 
        ${data.billable ?? true}
      )
      RETURNING *
    `
    return result[0]
  },

  // Clients
  async getClientsByWorkspace(workspaceId: string) {
    return sql`
      SELECT * FROM clockify.clients
      WHERE workspace_id = ${workspaceId} AND archived = false
      ORDER BY name ASC
    `
  },

  async createClient(data: {
    workspaceId: string
    name: string
    email?: string
    address?: string
  }) {
    const result = await sql`
      INSERT INTO clockify.clients (workspace_id, name, email, address)
      VALUES (${data.workspaceId}, ${data.name}, ${data.email || null}, ${data.address || null})
      RETURNING *
    `
    return result[0]
  },

  // Tags
  async getTagsByWorkspace(workspaceId: string) {
    return sql`
      SELECT * FROM clockify.tags
      WHERE workspace_id = ${workspaceId} AND archived = false
      ORDER BY name ASC
    `
  },

  async createTag(workspaceId: string, name: string) {
    const result = await sql`
      INSERT INTO clockify.tags (workspace_id, name)
      VALUES (${workspaceId}, ${name})
      RETURNING *
    `
    return result[0]
  },

  // Tasks
  async getTasksByProject(projectId: string) {
    return sql`
      SELECT * FROM clockify.tasks
      WHERE project_id = ${projectId}
      ORDER BY name ASC
    `
  },

  async createTask(projectId: string, name: string) {
    const result = await sql`
      INSERT INTO clockify.tasks (project_id, name)
      VALUES (${projectId}, ${name})
      RETURNING *
    `
    return result[0]
  },
}
