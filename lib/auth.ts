import { sql } from "./db"

export interface Session {
  userId: string
  email: string
  name: string
}

// Simple session management using database
export const auth = {
  async createUser(email: string, password: string, name: string) {
    // Hash password (in production, use bcrypt or similar)
    const hashedPassword = await hashPassword(password)
    
    // Generate a unique ID
    const userId = crypto.randomUUID()
    
    // Create raw_json with the correct structure for generated columns
    const rawJson = {
      id: userId,
      primary_email: email,
      display_name: name,
      signed_up_at_millis: Date.now(),
      password: hashedPassword
    }

    const result = await sql`
      INSERT INTO neon_auth.users_sync (raw_json)
      VALUES (${JSON.stringify(rawJson)})
      RETURNING id, email, name, created_at
    `

    return result[0]
  },

  async verifyCredentials(email: string, password: string) {
    const result = await sql`
      SELECT id, email, name, raw_json
      FROM neon_auth.users_sync
      WHERE raw_json->>'primary_email' = ${email} AND deleted_at IS NULL
    `

    if (result.length === 0) {
      return null
    }

    const user = result[0]
    const storedPassword = user.raw_json?.password

    if (!storedPassword) {
      return null
    }

    const isValid = await verifyPassword(password, storedPassword)

    if (!isValid) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    }
  },

  async getUserById(userId: string) {
    const result = await sql`
      SELECT id, email, name, created_at
      FROM neon_auth.users_sync
      WHERE raw_json->>'id' = ${userId} AND deleted_at IS NULL
    `

    return result[0] || null
  },

  async getUserByEmail(email: string) {
    const result = await sql`
      SELECT id, email, name, created_at
      FROM neon_auth.users_sync
      WHERE raw_json->>'primary_email' = ${email} AND deleted_at IS NULL
    `

    return result[0] || null
  },
}

// Simple password hashing (in production, use bcrypt)
async function hashPassword(password: string): Promise<string> {
  // For demo purposes, using a simple hash
  // In production, use: import bcrypt from 'bcryptjs'; return bcrypt.hash(password, 10);
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hash = await hashPassword(password)
  return hash === hashedPassword
}
