import { neon } from "@neondatabase/serverless"
import { readFileSync } from "fs"
import { resolve } from "path"
import { config } from "dotenv"

config({ path: resolve(process.cwd(), ".env.local") })

const connectionString = process.env.NEON_POSTGRES_URL || process.env.DATABASE_URL

if (!connectionString) {
  console.error("❌ Error: NEON_POSTGRES_URL not set")
  process.exit(1)
}

const sql = neon(connectionString)

const schemaContent = readFileSync(resolve(process.cwd(), "scripts", "001-create-schema.sql"), "utf-8")

async function setup() {
  try {
    console.log("📄 Parsing SQL statements...")
    
    // Split by semicolon
    const statements = schemaContent
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .filter(s => !s.startsWith("--"))

    console.log(`📋 Found ${statements.length} statements`)
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i]
      try {
        await sql.unsafe(stmt)
        console.log(`✅ Statement ${i + 1}/${statements.length} executed`)
      } catch (err: any) {
        if (err.message?.includes("already exists") || err.code === "42P07") {
          console.log(`⚠️  Statement ${i + 1}/${statements.length} already exists`)
        } else {
          console.error(`❌ Error in statement ${i + 1}:`, err.message)
          console.error("Statement:", stmt.substring(0, 100))
        }
      }
    }
    
    console.log("✅ Done!")
  } catch (error: any) {
    console.error("❌ Error:", error.message)
  }
}

setup()

