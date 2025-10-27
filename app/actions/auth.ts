"use server"

import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { createSession, destroySession, setSessionUserId } from "@/lib/session"
import { db } from "@/lib/db"

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string

  if (!email || !password || !name) {
    return { error: "All fields are required" }
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" }
  }

  try {
    // Check if user already exists
    const existingUser = await auth.getUserByEmail(email)
    if (existingUser) {
      return { error: "User with this email already exists" }
    }

    // Create user
    const user = await auth.createUser(email, password, name)

    // Create default workspace
    const workspace = await db.createWorkspace(`${name}'s Workspace`, user.id)

    // Add user to workspace as owner
    await db.sql`
      INSERT INTO clockify.workspace_members (workspace_id, user_id, role)
      VALUES (${workspace.id}, ${user.id}, 'owner')
    `

    // Set default workspace
    await db.sql`
      UPDATE clockify.users
      SET default_workspace_id = ${workspace.id}
      WHERE id = ${user.id}
    `

    // Create session
    await createSession(user.id)
    await setSessionUserId(user.id)
  } catch (error) {
    console.error("[v0] Sign up error:", error)
    return { error: "Failed to create account" }
  }

  redirect("/dashboard")
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  try {
    const user = await auth.verifyCredentials(email, password)

    if (!user) {
      return { error: "Invalid email or password" }
    }

    // Create session
    await createSession(user.id)
    await setSessionUserId(user.id)
  } catch (error) {
    console.error("[v0] Sign in error:", error)
    return { error: "Failed to sign in" }
  }

  redirect("/dashboard")
}

export async function signOut() {
  await destroySession()
  redirect("/login")
}
