import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { SignUpForm } from "@/components/signup-form"

export default async function SignUpPage() {
  const session = await getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <SignUpForm />
    </div>
  )
}
