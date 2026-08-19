import { useState } from "react"
import { Plus, Pencil, Trash2, Check, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export interface TypeField {
  name: string
  label: string
  type: "text" | "number"
}

interface TypesManagerDialogProps<T extends Record<string, unknown> & { id: string }> {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  fields: TypeField[]
  items: T[]
  onAdd: (values: Record<string, string | number>) => void
  onUpdate: (id: string, values: Record<string, string | number>) => void
  onDelete: (id: string) => void
}

function emptyDraft(fields: TypeField[]): Record<string, string | number> {
  const draft: Record<string, string | number> = {}
  fields.forEach((f) => {
    draft[f.name] = f.type === "number" ? 0 : ""
  })
  return draft
}

export function TypesManagerDialog<T extends Record<string, unknown> & { id: string }>({
  open,
  onOpenChange,
  title,
  fields,
  items,
  onAdd,
  onUpdate,
  onDelete,
}: TypesManagerDialogProps<T>) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Record<string, string | number>>(emptyDraft(fields))
  const [creating, setCreating] = useState(false)
  const [newDraft, setNewDraft] = useState<Record<string, string | number>>(emptyDraft(fields))

  function startEdit(item: T) {
    const d: Record<string, string | number> = {}
    fields.forEach((f) => {
      d[f.name] = item[f.name] as string | number
    })
    setDraft(d)
    setEditingId(item.id)
  }

  function saveEdit() {
    if (editingId) onUpdate(editingId, draft)
    setEditingId(null)
  }

  function saveCreate() {
    const hasContent = fields.some((f) => (f.type === "text" ? String(newDraft[f.name]).trim().length > 0 : true))
    if (!hasContent) return
    onAdd(newDraft)
    setNewDraft(emptyDraft(fields))
    setCreating(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex max-h-80 flex-col gap-1.5 overflow-y-auto pr-1">
          {items.length === 0 && !creating && (
            <p className="px-1 py-4 text-center text-sm text-muted-foreground">Aucun élément pour l'instant.</p>
          )}

          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
              {editingId === item.id ? (
                <>
                  {fields.map((f) => (
                    <input
                      key={f.name}
                      type={f.type}
                      value={draft[f.name]}
                      onChange={(e) =>
                        setDraft({ ...draft, [f.name]: f.type === "number" ? Number(e.target.value) : e.target.value })
                      }
                      className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  ))}
                  <Button variant="ghost" size="icon" onClick={saveEdit} aria-label="Enregistrer">
                    <Check className="h-4 w-4 text-success" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setEditingId(null)} aria-label="Annuler">
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1 truncate text-sm text-foreground">
                    {fields.map((f) => item[f.name]).join(" — ")}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => startEdit(item)} aria-label="Modifier">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} aria-label="Supprimer">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </>
              )}
            </div>
          ))}

          {creating && (
            <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-3 py-2">
              {fields.map((f, i) => (
                <input
                  key={f.name}
                  type={f.type}
                  placeholder={f.label}
                  value={newDraft[f.name]}
                  onChange={(e) =>
                    setNewDraft({ ...newDraft, [f.name]: f.type === "number" ? Number(e.target.value) : e.target.value })
                  }
                  autoFocus={i === 0}
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              ))}
              <Button variant="ghost" size="icon" onClick={saveCreate} aria-label="Enregistrer">
                <Check className="h-4 w-4 text-success" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setCreating(false)} aria-label="Annuler">
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {!creating && (
          <Button variant="outline" onClick={() => setCreating(true)} className="mt-2 gap-2">
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}