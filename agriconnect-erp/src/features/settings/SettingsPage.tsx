import { useState } from "react"
import {
  User,
  ShieldCheck,
  Palette,
  Bell,
  Globe,
  Users,
  UserCog,
  SlidersHorizontal,
  DatabaseBackup,
  CircleCheck,
  type LucideIcon,
} from "lucide-react"

type SettingsTab = {
  id: string
  label: string
  icon: LucideIcon
  group: "Compte" | "Administration" | "Données"
}

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

const GROUPS = ["Compte", "Administration", "Données"] as const

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<string>("profil")
  const active = TABS.find((t) => t.id === activeTab)!

  return (
    <div className="flex gap-8">
      <aside className="w-64 shrink-0">
        {GROUPS.map((group) => (
          <div key={group} className="mb-6">
            <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {group}
            </p>
            <ul className="flex flex-col gap-0.5">
              {TABS.filter((t) => t.group === group).map(({ id, label, icon: Icon }) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors duration-200 ${
                      activeTab === id
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-surface"
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

      <section key={activeTab} className="flex-1 animate-content-in">
        <h2 className="mb-1 text-2xl font-bold">{active.label}</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Section « {active.label} » — contenu réel à brancher au sprint concerné.
        </p>
        <div className="rounded-xl border border-border bg-surface p-8 text-sm text-muted-foreground">
          Emplacement réservé pour le contenu de « {active.label} ».
        </div>
      </section>
    </div>
  )
}