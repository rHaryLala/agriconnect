import { Link } from "react-router"
import { useTranslation } from "react-i18next"
import { Leaf, ArrowLeft } from "lucide-react"
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher"
import { LEGAL_DOCUMENTS, LEGAL_UPDATED_AT, LEGAL_UPDATED_LABEL, OPERATOR } from "./legalContent"
import type { LegalBlock, LegalDocumentContent } from "./legalContent"

/**
 * Gabarit commun aux trois documents légaux.
 *
 * La structure est volontairement sémantique plutôt que décorative : <header>
 * pour l'en-tête du site, <nav> pour le sommaire et pour les liens de bas de
 * page, <main> pour le contenu, une <section> par article, <footer> pour le
 * pied. La hiérarchie de titres est stricte — un seul <h1> (le titre du
 * document), puis des <h2> pour les articles, sans niveau sauté. C'est ce qui
 * rend le document lisible au lecteur d'écran et exploitable par un crawler.
 */

function Block({ block }: { block: LegalBlock }) {
  switch (block.kind) {
    case "p":
      return <p className="text-sm leading-relaxed text-muted-foreground">{block.text}</p>

    case "ul":
      return (
        <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )

    // <dl> et non une liste à puces : chaque entrée est un terme et sa
    // définition, et le lecteur d'écran annonce ce couple comme tel.
    case "dl":
      return (
        <dl className="flex flex-col gap-3">
          {block.items.map((item) => (
            <div key={item.term}>
              <dt className="text-sm font-semibold text-foreground">{item.term}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</dd>
            </div>
          ))}
        </dl>
      )

    // <caption> plutôt qu'un titre au-dessus : la légende reste attachée au
    // tableau quand on le parcourt au clavier ou au lecteur d'écran.
    case "table":
      return (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
            <caption className="sr-only">{block.caption}</caption>
            <thead>
              <tr className="border-b border-border">
                {block.columns.map((column) => (
                  <th key={column} scope="col" className="py-2 pr-4 font-semibold text-foreground">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row[0]} className="border-b border-border/60 align-top">
                  {row.map((cell, index) => (
                    <td key={index} className="py-2 pr-4 leading-relaxed text-muted-foreground">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
  }
}

export function LegalDocumentView({ document }: { document: LegalDocumentContent }) {
  const { t } = useTranslation()
  const others = LEGAL_DOCUMENTS.filter((entry) => entry.slug !== document.slug)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/85 px-6 backdrop-blur-xl">
        <Link to="/" className="group flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            {/* Icône purement décorative : le nom qui suit porte déjà l'information. */}
            <Leaf className="h-4 w-4 text-primary-foreground" strokeWidth={2} aria-hidden="true" />
          </span>
          <span className="font-semibold text-foreground">AgriConnect</span>
        </Link>
        <LanguageSwitcher compact />
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("legal.backHome")}
        </Link>

        <h1 className="mt-6 font-serif text-3xl leading-tight text-foreground sm:text-4xl">{document.title}</h1>

        <p className="mt-3 text-sm text-muted-foreground">
          {t("legal.lastUpdated")}{" "}
          {/* <time> donne la date en format machine tout en affichant le format lisible. */}
          <time dateTime={LEGAL_UPDATED_AT}>{LEGAL_UPDATED_LABEL}</time>
        </p>

        <p className="mt-6 border-l-2 border-primary pl-4 text-base leading-relaxed text-foreground">{document.lead}</p>

        <nav aria-labelledby="legal-toc-heading" className="mt-10 rounded-xl border border-border bg-card p-5">
          <h2 id="legal-toc-heading" className="text-sm font-semibold text-foreground">
            {t("legal.tableOfContents")}
          </h2>
          <ol className="mt-3 flex flex-col gap-1.5 text-sm">
            {document.sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="rounded text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 flex flex-col gap-10">
          {document.sections.map((section) => (
            // scroll-mt compense l'en-tête collant : sans lui, une ancre place
            // le titre sous le bandeau et on croit que le lien n'a rien fait.
            <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`} className="scroll-mt-24">
              <h2 id={`${section.id}-heading`} className="text-lg font-semibold text-foreground">
                {section.heading}
              </h2>
              <div className="mt-3 flex flex-col gap-3">
                {section.blocks.map((block, index) => (
                  <Block key={index} block={block} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-14 border-t border-border pt-6">
          <address className="not-italic text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{OPERATOR.name}</span>
            <br />
            {OPERATOR.address}
            <br />
            <a
              href={`mailto:${OPERATOR.email}`}
              className="rounded underline-offset-2 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {OPERATOR.email}
            </a>
            {" · "}
            <a
              href={`tel:${OPERATOR.phone.replace(/\s/g, "")}`}
              className="rounded underline-offset-2 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {OPERATOR.phone}
            </a>
          </address>

          <nav aria-labelledby="legal-related-heading" className="mt-6">
            <h2 id="legal-related-heading" className="text-sm font-semibold text-foreground">
              {t("legal.otherDocuments")}
            </h2>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm">
              {others.map((entry) => (
                <li key={entry.slug}>
                  <Link
                    to={`/legal/${entry.slug}`}
                    className="rounded text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {entry.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </footer>
      </main>
    </div>
  )
}
