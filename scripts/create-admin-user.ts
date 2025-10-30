import { neon } from "@neondatabase/serverless"
import { config } from "dotenv"
import { resolve } from "path"

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") })

// Use environment variable or fallback
const connectionString = process.env.NEON_POSTGRES_URL || process.env.DATABASE_URL

if (!connectionString) {
  console.error("❌ Error: NEON_POSTGRES_URL or DATABASE_URL environment variable is not set")
  console.error("Please set the environment variable in your .env.local file")
  process.exit(1)
}

const sql = neon(connectionString)

// Hash password using SHA-256 (same as lib/auth.ts)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

async function createAdminUser() {
  const email = "admin@clockify.com"
  const password = "admin123"
  const fullName = "Admin User"

  try {
    console.log("🔍 Checking if admin user already exists...")
    
    // Check if user already exists (check in raw_json since email is generated)
    let existingUser = await sql`
      SELECT id FROM neon_auth.users_sync WHERE raw_json->>'primary_email' = ${email} AND deleted_at IS NULL
    `

    let user: any

    if (existingUser.length > 0) {
      console.log("ℹ️  Admin user already exists, continuing with setup...")
      // Get existing user
      const userResult = await sql`
        SELECT id, email, name FROM neon_auth.users_sync WHERE raw_json->>'primary_email' = ${email} AND deleted_at IS NULL
      `
      user = userResult[0]
      console.log("✅ Using existing user:", user.email)
    } else {
      console.log("🔐 Hashing password...")
      // Hash the password using the same method as the app
      const passwordHash = await hashPassword(password)

      console.log("👤 Creating admin user...")
      // Generate a unique ID
      const userId = crypto.randomUUID()
      
      // Create raw_json with the correct structure for generated columns
      const rawJson = {
        id: userId,
        primary_email: email,
        display_name: fullName,
        signed_up_at_millis: Date.now(),
        password: passwordHash
      }
      
      // Insert only into raw_json (other columns are generated)
      const userResult = await sql`
        INSERT INTO neon_auth.users_sync (raw_json)
        VALUES (${JSON.stringify(rawJson)})
        RETURNING id, email, name
      `
      
      user = userResult[0]
      console.log("✅ User created:", user.email)
    }

    console.log("👤 Creating entry in clockify.users...")
    // Create entry in clockify.users (if not exists)
    await sql`
      INSERT INTO clockify.users (id, settings)
      VALUES (${user.id}, '{"timeFormat": "12h", "dateFormat": "MM/DD/YYYY", "weekStart": "monday"}'::jsonb)
      ON CONFLICT (id) DO NOTHING
    `

    // Check if workspace already exists
    let workspaceResult = await sql`
      SELECT id, name FROM clockify.workspaces WHERE owner_id = ${user.id} LIMIT 1
    `
    
    if (workspaceResult.length === 0) {
      console.log("🏢 Creating default workspace...")
      // Create a default workspace for the admin
      workspaceResult = await sql`
        INSERT INTO clockify.workspaces (name, owner_id)
        VALUES ('Admin Workspace', ${user.id})
        RETURNING id, name
      `
    } else {
      console.log("ℹ️  Workspace already exists")
    }
    
    const workspace = workspaceResult[0]

    console.log("👥 Adding admin as workspace member...")
    // Add admin as workspace member (if not exists)
    await sql`
      INSERT INTO clockify.workspace_members (workspace_id, user_id, role)
      VALUES (${workspace.id}, ${user.id}, 'owner')
      ON CONFLICT (workspace_id, user_id) DO NOTHING
    `

    console.log("⚙️ Setting default workspace...")
    // Set as default workspace
    await sql`
      UPDATE clockify.users
      SET default_workspace_id = ${workspace.id}
      WHERE id = ${user.id}
    `

    console.log("\n✅ Admin user created successfully!")
    console.log("📧 Email:", email)
    console.log("🔑 Password:", password)
    console.log("👤 Name:", fullName)
    console.log("🏢 Workspace:", workspace.name)
    console.log("\n⚠️  Please change the password after first login!")
  } catch (error) {
    console.error("❌ Error creating admin user:", error)
    throw error
  }
}

createAdminUser()
  .then(() => {
    console.log("\n✨ Script completed successfully!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n💥 Script failed:", error)
    process.exit(1)
  })
