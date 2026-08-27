import type { User } from "@/types/user"

export const MOCK_USERS: (User & { password: string })[] = [
  {
    id: "1",
    name: "LESOA Asandratriniaina",
    email: "lesoa.asa@zurcher.edu.mg",
    password: "1234qwerty",
    role: "admin",
    avatarInitials: "LA",
  },
  {
    id: "2",
    name: "RASAMIZAFY Simeon",
    email: "rasamizafy.sit@zurcher.edu.mg",
    password: "1234qwerty",
    role: "comptable",
    avatarInitials: "RS",
  },
  {
    id: "3",
    name: "RADONIAINA Voahary",
    email: "radoniaina.v@zurcher.edu.mg",
    password: "1234qwerty",
    role: "ouvrier",
    avatarInitials: "RV",
  },
]