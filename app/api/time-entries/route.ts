
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { TimeEntryPayload } from "@/lib/types"
import { z } from "zod"

// Zod schema for validating a single time entry
const timeEntrySchema = z.object({
  workspace_id: z.string().uuid(),
  user_id: z.string(),
  project_id: z.string().uuid().optional(),
  description: z.string().optional(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime().optional(),
  billable: z.boolean().optional().default(true),
  tag_ids: z.array(z.string().uuid()).optional(),
})

// Zod schema for validating the request body (an array of time entries)
const requestBodySchema = z.array(timeEntrySchema)

export async function GET(request: NextRequest) {
  // 1. Authenticate the request
  const authHeader = request.headers.get("Authorization")
  const apiKey = authHeader?.split(" ")[1]

  if (!apiKey || apiKey !== process.env.N8N_API_KEY) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  // 2. Get workspace_id from query params
  const searchParams = request.nextUrl.searchParams
  const workspace_id = searchParams.get("workspace_id")

  if (!workspace_id) {
    return NextResponse.json(
      { message: "workspace_id is required" },
      { status: 400 }
    )
  }

  // 3. Fetch data from the database
  try {
    const projects = await db.sql`
      SELECT id, name, client_id FROM clockify.projects WHERE workspace_id = ${workspace_id}
    `

    const clients = await db.sql`
      SELECT id, name FROM clockify.clients WHERE workspace_id = ${workspace_id}
    `

    const tags = await db.sql`
      SELECT id, name FROM clockify.tags WHERE workspace_id = ${workspace_id}
    `

    return NextResponse.json({
      projects,
      clients,
      tags,
    })
  } catch (error) {
    console.error("Failed to fetch tasks:", error)
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  // 1. Authenticate the request
  const authHeader = request.headers.get("Authorization")
  const apiKey = authHeader?.split(" ")[1]

  if (!apiKey || apiKey !== process.env.N8N_API_KEY) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  // 2. Parse and validate the request body
  let body
  try {
    body = await request.json()
  } catch (error) {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 })
  }

  const validation = requestBodySchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json(
      {
        message: "Invalid request body",
        errors: validation.error.flatten().fieldErrors,
      },
      { status: 400 }
    )
  }

  const timeEntriesPayload: TimeEntryPayload[] = validation.data

  // 3. Insert the time entries into the database
  try {
    const results = []
    for (const entry of timeEntriesPayload) {
      const { tag_ids, ...timeEntryData } = entry
      const startTime = new Date(entry.start_time)
      const endTime = entry.end_time ? new Date(entry.end_time) : null

      // Insertar el registro en time_entries
      const [insertedEntry] = await db.sql`
        INSERT INTO clockify.time_entries (
          workspace_id, user_id, project_id, description, start_time, end_time, billable
        ) VALUES (
          ${timeEntryData.workspace_id},
          ${timeEntryData.user_id},
          ${timeEntryData.project_id || null},
          ${timeEntryData.description || ''},
          ${startTime},
          ${endTime},
          ${timeEntryData.billable ?? true}
        ) RETURNING *
      `

      // Si hay tags, insértalos en la tabla de unión
      if (tag_ids && tag_ids.length > 0) {
        for (const tag_id of tag_ids) {
          await db.sql`
            INSERT INTO clockify.time_entry_tags (time_entry_id, tag_id)
            VALUES (${insertedEntry.id}, ${tag_id})
          `
        }
      }

      results.push(insertedEntry)
    }

    return NextResponse.json(
      {
        message: "Time entries created successfully",
        count: results.length,
        data: results,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Failed to create time entries:", error)
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    )
  }
}
