import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

const sql = neon(process.env.NEON_POSTGRES_URL!)

async function createAdminUser() {
  const email = "admin@clockify.com"
  const password = "admin123"
  const fullName = "Admin User"

  try {
    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUser.length > 0) {
      console.log("❌ Admin user already exists with email:", email)
      return
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create the user
    const [user] = await sql`
      INSERT INTO users (email, password_hash, full_name)
      VALUES (${email}, ${passwordHash}, ${fullName})
      RETURNING id, email, full_name
    `

    // Create a default workspace for the admin
    const [workspace] = await sql`
      INSERT INTO workspaces (name, owner_id)
      VALUES ('Admin Workspace', ${user.id})
      RETURNING id, name
    `

    // Add admin as workspace member
    await sql`
      INSERT INTO workspace_members (workspace_id, user_id, role)
      VALUES (${workspace.id}, ${user.id}, 'admin')
    `

    console.log("✅ Admin user created successfully!")
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
