import { cookies } from "next/headers"
import { auth, type Session } from "./auth"

const SESSION_COOKIE_NAME = "clockify_session"
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export async function createSession(userId: string): Promise<string> {
  const sessionToken = crypto.randomUUID()
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  })

  // Store session in a simple way (in production, use Redis or similar)
  // For now, we'll encode the userId in the token itself
  return sessionToken
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)

  if (!sessionToken) {
    return null
  }

  // In production, validate the session token from a session store
  // For now, we'll decode it from the cookie and verify the user exists
  try {
    // Simple approach: store userId in cookie and verify user exists
    const userId = cookieStore.get("clockify_user_id")?.value

    if (!userId) {
      return null
    }

    const user = await auth.getUserById(userId)

    if (!user) {
      return null
    }

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
    }
  } catch (error) {
    return null
  }
}

export async function setSessionUserId(userId: string) {
  const cookieStore = await cookies()
  cookieStore.set("clockify_user_id", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  })
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
  cookieStore.delete("clockify_user_id")
}

export async function requireAuth(): Promise<Session> {
  const session = await getSession()

  if (!session) {
    throw new Error("Unauthorized")
  }

  return session
}
