import "./i18n/config.ts"
import { readStoredConsent, applyConsent } from './features/consent/consentStore.ts'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App.tsx'
import { useAppearanceStore, applyAppearance } from './features/settings/appearanceStore.ts'

// La supervision d'erreurs ne demarre que si l'utilisateur l'a acceptee.
// Le choix est lu en synchrone, AVANT le premier rendu : attendre un effet
// React laisserait une fenetre ou Sentry pourrait s'initialiser sans
// consentement. Aucun choix enregistre => aucun tracage.
applyConsent(readStoredConsent())

const { accent, compactView, animations } = useAppearanceStore.getState()
applyAppearance(accent, compactView, animations)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
