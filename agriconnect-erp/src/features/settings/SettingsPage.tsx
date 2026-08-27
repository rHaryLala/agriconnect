import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { UsersManagement } from "./UsersManagement"
import {
  User, ShieldCheck, Palette, Bell, Globe,
  Users, UserCog, SlidersHorizontal, DatabaseBackup, CircleCheck,
  type LucideIcon,
} from "lucide-react"
import { useAuthStore } from "@/features/auth/authStore"

type SettingsTab = { id: string; label: string; icon: LucideIcon; group: "Compte" | "Administration" | "Données" }

const TABS: SettingsTab[] = [
  { id: "profil", label: "Profil", icon: User, group: "Compte" },
  { id: "securite", label: "Sécurité", icon: ShieldCheck, group: "Compte" },
  { id: "apparence", label: "Apparence", icon: Palette, group: "Compte" },
  { id: "notifications", label: "Notifications", icon: Bell, group: "Compte" },
  { id: "langue", label: "Langue & région", icon: Globe, group: "Compte" },
  { id: "utilisateurs", label: "Utilisateurs", icon: Users, group: "Administration" },
  { id: "roles", label: "Rôles & permissions", icon: UserCog, group: "Administration" },
  { id: "systeme", label: "Configuration système", icon: SlidersHorizontal, group: "Administration" },
  { id: "sauvegarde", label: "Sauvegarde", icon: DatabaseBackup, group: "Données" },
  { id: "statut", label: "Statut système", icon: CircleCheck, group: "Données" },
]

const ALL_GROUPS = ["Compte", "Administration", "Données"] as const

export default function SettingsPage() {
  const role = useAuthStore((s) => s.user?.role)
  const [activeTab, setActiveTab] = useState<string>("profil")
  const [openGroupMobile, setOpenGroupMobile] = useState<string>("Compte")

  const groups = ALL_GROUPS.filter((g) => g !== "Administration" || role === "admin")
  const visibleTabs = TABS.filter((t) => groups.includes(t.group))
  const active = visibleTabs.find((t) => t.id === activeTab) ?? visibleTabs[0]

  function selectTab(id: string, group: string) {
    setActiveTab(id)
    setOpenGroupMobile(group)
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <aside className="hidden lg:block lg:w-64 lg:shrink-0">
        {groups.map((group) => (
          <div key={group} className="mb-6">
            <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{group}</p>
            <ul className="flex flex-col gap-0.5">
              {TABS.filter((t) => t.group === group).map(({ id, label, icon: Icon }) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => selectTab(id, group)}
                    className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors duration-200 ${
                      active.id === id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-surface"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>

      <div className="flex flex-col gap-2 lg:hidden">
        {groups.map((group) => {
          const isOpen = openGroupMobile === group
          return (
            <div key={group} className="overflow-hidden rounded-xl border border-border bg-surface">
              <button
                type="button"
                onClick={() => setOpenGroupMobile(isOpen ? "" : group)}
                className="flex min-h-[44px] w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground"
                aria-expanded={isOpen}
              >
                {group}
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
              </button>
              <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                  <ul className="flex flex-col gap-0.5 px-2 pb-2">
                    {TABS.filter((t) => t.group === group).map(({ id, label, icon: Icon }) => (
                      <li key={id}>
                        <button
                          type="button"
                          onClick={() => selectTab(id, group)}
                          className={`flex min-h-[44px] w-full items-center gap-2.5 rounded-md px-3 text-left text-sm transition-colors duration-200 ${
                            active.id === id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-background"
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                          {label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <section key={active.id} className="flex-1 animate-content-in">
        <h2 className="mb-1 text-2xl font-bold">{active.label}</h2>
        {active.id === "utilisateurs" ? (
          <UsersManagement />
        ) : (
          <>
            <p className="mb-6 text-sm text-muted-foreground">Section « {active.label} » — contenu réel à brancher au sprint concerné.</p>
            <div className="rounded-xl border border-border bg-surface p-8 text-sm text-muted-foreground">
              Emplacement réservé pour le contenu de « {active.label} ».
            </div>
          </>
        )}
      </section>
    </div>
  )
}