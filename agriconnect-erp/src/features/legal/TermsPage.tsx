import { LegalDocumentView } from "./LegalDocumentView"
import { TERMS_OF_USE } from "./legalContent"

export default function TermsPage() {
  return <LegalDocumentView document={TERMS_OF_USE} />
}
