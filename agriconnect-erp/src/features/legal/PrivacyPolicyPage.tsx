import { LegalDocumentView } from "./LegalDocumentView"
import { PRIVACY_POLICY } from "./legalContent"

export default function PrivacyPolicyPage() {
  return <LegalDocumentView document={PRIVACY_POLICY} />
}
