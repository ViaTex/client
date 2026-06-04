import { redirect } from "next/navigation"

export default function MentorSettingsRedirect() {
  redirect("/dashboard/mentor/profile")
}
