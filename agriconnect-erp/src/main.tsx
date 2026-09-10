import "./i18n/config.ts"
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App.tsx'
import { useAppearanceStore, applyAppearance } from './features/settings/appearanceStore.ts'

const { accent, compactView, animations } = useAppearanceStore.getState()
applyAppearance(accent, compactView, animations)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
