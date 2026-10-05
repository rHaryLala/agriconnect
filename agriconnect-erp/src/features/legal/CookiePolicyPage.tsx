import { LegalDocumentView } from "./LegalDocumentView"
import { COOKIE_POLICY } from "./legalContent"

export default function CookiePolicyPage() {
  return <LegalDocumentView document={COOKIE_POLICY} />
}
