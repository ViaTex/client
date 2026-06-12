export type MentorSidebarItem = {
  name: string
  href: string | null
  badge?: number
  iconKey: "dashboard" | "profile" | "evaluations" | "vivas" | "projects" | "reports" | "messages" | "settings"
  comingSoon?: boolean
}

/**
 * Mentor sidebar menu content only.
 * This file is intentionally UI-agnostic so the component layout can stay unchanged.
 */
export const mentorSidebarInfo: MentorSidebarItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard/mentor",
    iconKey: "dashboard",
  },
  {
    name: "My Profile",
    href: "/dashboard/mentor/profile",
    iconKey: "profile",
  },
  {
    name: "Skill Evaluations",
    href: "/dashboard/mentor/evaluations",
    badge: 1,
    iconKey: "evaluations",
  },
  {
    name: "Scheduled Vivas",
    href: "/dashboard/mentor/vivas",
    iconKey: "vivas",
  },
  {
    name: "Projects",
    href: "/dashboard/mentor/projects",
    iconKey: "projects",
  },
  {
    name: "Reports",
    href: "/dashboard/mentor/reports",
    iconKey: "reports",
  },

  {
    name: "Settings",
    href: "/dashboard/mentor/settings",
    iconKey: "settings",
  },
]
