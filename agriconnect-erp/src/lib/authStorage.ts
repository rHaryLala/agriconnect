const REMEMBER_KEY = "agriconnect-remember-me"

export function setRememberPreference(remember: boolean) {
  localStorage.setItem(REMEMBER_KEY, String(remember))
}

function getRememberPreference(): boolean {
  return localStorage.getItem(REMEMBER_KEY) === "true"
}

export const dynamicAuthStorage = {
  getItem: (name: string): string | null => {
    const storage = getRememberPreference() ? localStorage : sessionStorage
    return storage.getItem(name)
  },
  setItem: (name: string, value: string): void => {
    const storage = getRememberPreference() ? localStorage : sessionStorage
    storage.setItem(name, value)
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name)
    sessionStorage.removeItem(name)
    localStorage.removeItem(REMEMBER_KEY)
  },
}