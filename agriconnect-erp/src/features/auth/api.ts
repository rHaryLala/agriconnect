import type { User } from "@/types/user"
import { MOCK_USERS } from "./mockUsers"

const FAKE_LATENCY_MS = 700

export function mockLogin(email: string, password: string): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const match = MOCK_USERS.find((u) => u.email === email && u.password === password)
      if (!match) {
        reject(new Error("Email ou mot de passe incorrect."))
        return
      }
      const { password: _password, ...user } = match
      resolve(user)
    }, FAKE_LATENCY_MS)
  })
}