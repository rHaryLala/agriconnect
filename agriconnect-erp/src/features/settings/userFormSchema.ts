import { z } from "zod"

export const userFormSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().min(1, "L'email est requis").email("Format d'email invalide"),
  role: z.enum(["admin", "comptable", "ouvrier"], {
    errorMap: () => ({ message: "Sélectionne un rôle" }),
  }),
})

export type UserFormValues = z.infer<typeof userFormSchema>