/**
 * Contenu des trois documents légaux d'AgriConnect.
 *
 * Le contenu vit ici, sous forme de données, et non dans les fichiers de
 * traduction : un texte juridique mal traduit engage la ferme, alors qu'une
 * étiquette de navigation mal traduite ne coûte rien. Les libellés d'interface
 * passent donc par i18n, les documents eux-mêmes restent en français, langue
 * de référence des actes administratifs à Madagascar. Une version malgache
 * devra être relue par un juriste avant d'être publiée.
 *
 * Les inventaires de données et de traceurs ci-dessous sont tirés du code réel
 * (clés de persistance, variables d'environnement Sentry) : ils doivent être
 * mis à jour si la liste change, sinon le document devient faux.
 */

export const LEGAL_UPDATED_AT = "2026-10-05"
export const LEGAL_UPDATED_LABEL = "5 octobre 2026"

/** Identité de l'exploitant, reprise du pied de page de la page d'accueil. */
export const OPERATOR = {
  name: "Ferme de l'Université Adventiste Zurcher (UAZ)",
  shortName: "la Ferme UAZ",
  address: "Vohitsoa, Sambaina, Madagascar",
  email: "support@zurcher.edu.mg",
  phone: "+261 34 47 885 15",
  site: "agriconnect.zurcher.edu.mg",
} as const

export type LegalBlock =
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "dl"; items: { term: string; description: string }[] }
  | { kind: "table"; caption: string; columns: string[]; rows: string[][] }

export interface LegalSection {
  /** Sert d'ancre et de clé React ; stable, ne pas renommer sans raison. */
  id: string
  heading: string
  blocks: LegalBlock[]
}

export interface LegalDocumentContent {
  slug: string
  title: string
  description: string
  lead: string
  sections: LegalSection[]
}

// ---------------------------------------------------------------------------
// Politique de confidentialité
// ---------------------------------------------------------------------------

export const PRIVACY_POLICY: LegalDocumentContent = {
  slug: "confidentialite",
  title: "Politique de confidentialité",
  description:
    "Comment AgriConnect collecte, utilise et protège les données personnelles des utilisateurs de la ferme UAZ, conformément à la loi malgache n° 2014-038.",
  lead:
    "AgriConnect est l'outil de gestion interne de la Ferme de l'Université Adventiste Zurcher. Cette politique explique quelles données personnelles y sont traitées, pourquoi, combien de temps, et quels droits vous pouvez exercer.",
  sections: [
    {
      id: "responsable",
      heading: "1. Qui est responsable du traitement",
      blocks: [
        {
          kind: "p",
          text: `Le responsable du traitement est ${OPERATOR.name}, située ${OPERATOR.address}. Pour toute question relative à vos données personnelles, écrivez à ${OPERATOR.email} ou appelez le ${OPERATOR.phone}.`,
        },
        {
          kind: "p",
          text: "AgriConnect n'est pas un service ouvert au public : l'accès est réservé aux comptes créés par la direction de la ferme. Il n'y a pas d'inscription libre.",
        },
      ],
    },
    {
      id: "donnees",
      heading: "2. Quelles données sont traitées",
      blocks: [
        {
          kind: "dl",
          items: [
            {
              term: "Données de compte",
              description:
                "Nom, prénom, adresse électronique, rôle attribué (Gérant, Comptable, Ouvrier, Magasinier, Contrôleur interne), ferme de rattachement, et mot de passe conservé uniquement sous forme de condensat (hachage bcrypt) — jamais en clair.",
            },
            {
              term: "Données d'activité professionnelle",
              description:
                "Les écritures que vous saisissez portent votre identifiant : relevés de production, mouvements de stock, transferts, opérations de caisse, suivi du personnel. Cette traçabilité est le cœur du contrôle interne : elle permet de savoir qui a enregistré quoi, et de corriger une erreur sans effacer l'historique.",
            },
            {
              term: "Données relatives à des tiers",
              description:
                "Clients, fournisseurs et employés de la ferme sont enregistrés avec leur nom, leur téléphone, le cas échéant leur matricule et leur département. Ces personnes sont informées par la ferme du traitement les concernant.",
            },
            {
              term: "Données techniques",
              description:
                "Préférences d'affichage (langue, thème, mise en page), état de la file d'attente hors ligne, et — lorsque la supervision d'erreurs est activée et que vous y avez consenti — des rapports d'incident techniques. Voir la politique de cookies pour le détail.",
            },
          ],
        },
        {
          kind: "p",
          text: "AgriConnect ne traite aucune donnée sensible au sens de la loi : ni données de santé, ni opinions politiques, religieuses ou syndicales, ni données biométriques.",
        },
      ],
    },
    {
      id: "finalites",
      heading: "3. Pourquoi ces données sont traitées",
      blocks: [
        {
          kind: "ul",
          items: [
            "Permettre l'accès à l'application et appliquer les droits attachés à chaque rôle.",
            "Tenir la gestion quotidienne de la ferme : production, stock, caisse, clients, fournisseurs, personnel.",
            "Assurer la traçabilité et le contrôle interne des écritures, y compris leur correction.",
            "Produire les états comptables et les rapports exigés par la direction et par la réglementation.",
            "Maintenir la sécurité du service et diagnostiquer les incidents techniques.",
          ],
        },
        {
          kind: "p",
          text: "Ces traitements reposent sur l'exécution de la relation de travail ou du contrat commercial qui vous lie à la ferme, sur le respect des obligations comptables et fiscales qui pèsent sur elle, et sur son intérêt légitime à sécuriser son exploitation. La supervision technique facultative repose, elle, sur votre consentement.",
        },
      ],
    },
    {
      id: "destinataires",
      heading: "4. Qui y a accès",
      blocks: [
        {
          kind: "p",
          text: "L'accès est cloisonné par rôle. Un Ouvrier ne voit pas la caisse ; un Contrôleur interne lit l'ensemble sans pouvoir modifier ; seul un Gérant administre les comptes. Ce cloisonnement est appliqué par le serveur, et pas seulement masqué dans l'interface.",
        },
        {
          kind: "ul",
          items: [
            "Le personnel habilité de la ferme, dans la limite de son rôle.",
            "Le prestataire qui héberge le serveur et la base de données, pour les seuls besoins de l'hébergement.",
            "L'outil de supervision technique, si vous avez consenti aux traceurs de mesure.",
            "Les autorités publiques, lorsque la loi l'exige.",
          ],
        },
        {
          kind: "p",
          text: "Vos données ne sont ni vendues, ni louées, ni cédées à des fins publicitaires. AgriConnect ne contient aucune régie publicitaire.",
        },
      ],
    },
    {
      id: "transfert",
      heading: "5. Localisation et transferts hors de Madagascar",
      blocks: [
        {
          kind: "p",
          text: "Certains prestataires techniques (hébergement, supervision d'erreurs) peuvent exploiter des serveurs situés hors de Madagascar. Dans ce cas, la ferme s'assure que le transfert est encadré contractuellement et limité à ce qui est nécessaire au fonctionnement du service. La liste des prestataires et des pays concernés peut être obtenue sur demande à l'adresse indiquée à l'article 1.",
        },
      ],
    },
    {
      id: "conservation",
      heading: "6. Combien de temps elles sont conservées",
      blocks: [
        {
          kind: "dl",
          items: [
            {
              term: "Compte utilisateur",
              description:
                "Pendant toute la durée de la relation de travail, puis le temps nécessaire au traitement des obligations qui lui survivent.",
            },
            {
              term: "Écritures de production, de stock et de caisse",
              description:
                "Pendant la durée imposée par la réglementation comptable et fiscale malgache applicable à la ferme. Ces écritures ne sont pas supprimées : une erreur se corrige par une écriture inverse, afin que l'historique reste vérifiable.",
            },
            {
              term: "Préférences d'affichage",
              description:
                "Jusqu'à leur modification, ou jusqu'à l'effacement des données du navigateur. Elles ne quittent pas votre appareil.",
            },
            {
              term: "Rapports d'incident technique",
              description: "Pendant la durée de rétention de l'outil de supervision, et au plus quelques mois.",
            },
          ],
        },
        {
          kind: "p",
          text: "Un compte dont l'accès doit cesser est désactivé plutôt que détruit, précisément parce que les écritures qu'il a produites doivent rester attribuables.",
        },
      ],
    },
    {
      id: "securite",
      heading: "7. Comment elles sont protégées",
      blocks: [
        {
          kind: "ul",
          items: [
            "Les mots de passe sont conservés sous forme de condensat bcrypt ; personne, pas même un Gérant, ne peut les lire.",
            "L'authentification repose sur un jeton signé, et le rôle est revérifié en base à chaque requête : un droit retiré prend effet immédiatement.",
            "Les échanges entre l'application et le serveur sont chiffrés en transit.",
            "Les autorisations sont contrôlées côté serveur, route par route.",
            "Les rapports d'incident technique sont transmis sans le contenu des formulaires, pour éviter d'y exposer des données saisies.",
          ],
        },
        {
          kind: "p",
          text: "Aucune mesure n'est infaillible. Si un incident de sécurité affectait vos données, la ferme vous en informerait et prendrait les mesures correctives nécessaires.",
        },
      ],
    },
    {
      id: "droits",
      heading: "8. Vos droits",
      blocks: [
        {
          kind: "p",
          text: "Conformément à la loi n° 2014-038 du 9 janvier 2015 sur la protection des données à caractère personnel, vous disposez des droits suivants :",
        },
        {
          kind: "ul",
          items: [
            "Être informé du traitement dont vous faites l'objet — c'est l'objet du présent document.",
            "Accéder aux données qui vous concernent et en obtenir une copie.",
            "Faire rectifier une donnée inexacte ou incomplète.",
            "Vous opposer à un traitement, ou en demander la limitation, pour un motif légitime.",
            "Demander l'effacement des données qui ne sont pas nécessaires au respect d'une obligation légale ou à la traçabilité comptable.",
            "Retirer à tout moment votre consentement aux traceurs non essentiels, sans que cela n'affecte votre accès à l'application.",
          ],
        },
        {
          kind: "p",
          text: `Pour exercer ces droits, écrivez à ${OPERATOR.email} en précisant votre demande. Une réponse vous sera apportée dans un délai raisonnable. Si la réponse ne vous satisfait pas, vous pouvez saisir l'autorité malgache de protection des données personnelles.`,
        },
        {
          kind: "p",
          text: "Certaines demandes ne peuvent pas être satisfaites intégralement : une écriture comptable attribuée à votre compte ne peut être effacée sans détruire la traçabilité que la loi impose à la ferme de conserver. Dans ce cas, le motif du refus vous sera expliqué.",
        },
      ],
    },
    {
      id: "mineurs",
      heading: "9. Mineurs",
      blocks: [
        {
          kind: "p",
          text: "AgriConnect est un outil professionnel. Aucun compte n'est destiné à une personne mineure, et aucune donnée n'est collectée sciemment auprès de mineurs.",
        },
      ],
    },
    {
      id: "modifications",
      heading: "10. Modifications",
      blocks: [
        {
          kind: "p",
          text: `Cette politique peut évoluer avec l'application. La date de dernière mise à jour figure en tête de page. En cas de changement substantiel des finalités ou des destinataires, les utilisateurs seront informés dans l'application.`,
        },
      ],
    },
  ],
}

// ---------------------------------------------------------------------------
// Conditions générales d'utilisation
// ---------------------------------------------------------------------------

export const TERMS_OF_USE: LegalDocumentContent = {
  slug: "conditions-utilisation",
  title: "Conditions générales d'utilisation",
  description:
    "Règles d'accès et d'usage de l'application de gestion agricole AgriConnect, réservée au personnel habilité de la ferme UAZ.",
  lead:
    "Ces conditions régissent l'usage d'AgriConnect. En vous connectant à l'application, vous les acceptez. Si vous n'en acceptez pas les termes, n'utilisez pas le service et prévenez la direction de la ferme.",
  sections: [
    {
      id: "objet",
      heading: "1. Objet et champ d'application",
      blocks: [
        {
          kind: "p",
          text: `AgriConnect est une application de gestion agricole éditée et exploitée par ${OPERATOR.name}. Elle couvre le suivi de la production animale et végétale, la gestion des stocks et des transferts internes, la tenue de la caisse, le suivi des clients, des fournisseurs et du personnel, ainsi que l'édition de rapports.`,
        },
        {
          kind: "p",
          text: "Le service est strictement interne. Il n'est ni commercialisé, ni ouvert à l'inscription libre.",
        },
      ],
    },
    {
      id: "acces",
      heading: "2. Accès et comptes",
      blocks: [
        {
          kind: "ul",
          items: [
            "Les comptes sont créés par un Gérant. Il n'existe pas d'inscription publique : une fois le premier compte administrateur créé, la route d'inscription est fermée.",
            "Chaque compte est personnel. Le partage d'identifiants est interdit, car il rend la traçabilité des écritures inopérante.",
            "Vous êtes responsable de la confidentialité de votre mot de passe et devez signaler sans délai toute utilisation suspecte de votre compte.",
            "Un mot de passe provisoire remis à la création doit être changé dès la première connexion.",
          ],
        },
      ],
    },
    {
      id: "roles",
      heading: "3. Rôles et périmètre d'action",
      blocks: [
        {
          kind: "p",
          text: "Les droits découlent du rôle attribué à votre compte. Ce périmètre est appliqué par le serveur : contourner l'interface ne donne aucun droit supplémentaire.",
        },
        {
          kind: "table",
          caption: "Périmètre des rôles d'AgriConnect",
          columns: ["Rôle", "Périmètre"],
          rows: [
            ["Gérant", "Accès complet, y compris la gestion des comptes et des rôles."],
            ["Comptable", "Caisse, clients, fournisseurs et personnel en écriture ; production et stock en lecture."],
            ["Ouvrier", "Saisie de la production et des mouvements de stock."],
            ["Magasinier", "Production, stock et clients, pour le circuit Ferme → Magasinier → Store."],
            ["Contrôleur interne", "Lecture de l'ensemble des modules, sans aucun droit d'écriture."],
          ],
        },
      ],
    },
    {
      id: "obligations",
      heading: "4. Vos obligations",
      blocks: [
        {
          kind: "ul",
          items: [
            "Saisir des informations exactes et à jour : les stocks, la caisse et les rapports de la ferme en dépendent directement.",
            "N'utiliser l'application que pour l'activité de la ferme.",
            "Ne pas tenter d'accéder à des données hors de votre rôle, ni de contourner les contrôles d'accès.",
            "Ne pas extraire ni diffuser hors de la ferme les données de clients, de fournisseurs ou de personnel.",
            "Corriger une erreur de saisie par les fonctions prévues à cet effet, et non en détruisant l'écriture.",
          ],
        },
      ],
    },
    {
      id: "donnees",
      heading: "5. Propriété des données et du logiciel",
      blocks: [
        {
          kind: "p",
          text: "Les données d'exploitation saisies dans AgriConnect appartiennent à la ferme. Les droits de propriété intellectuelle sur l'application — code, interface, identité visuelle — appartiennent à son éditeur et ne vous sont pas transférés. L'accès qui vous est consenti est un droit d'usage personnel, non exclusif et révocable.",
        },
      ],
    },
    {
      id: "disponibilite",
      heading: "6. Disponibilité et fonctionnement hors ligne",
      blocks: [
        {
          kind: "p",
          text: "AgriConnect fonctionne hors connexion : les saisies effectuées sans réseau sont conservées sur l'appareil puis transmises au serveur dès que la connexion revient. Cette file d'attente est une commodité, pas une garantie.",
        },
        {
          kind: "ul",
          items: [
            "Vider les données du navigateur, ou désinstaller l'application, efface les saisies non encore synchronisées.",
            "Une saisie hors ligne n'est définitive qu'après synchronisation réussie.",
            "Le service peut être interrompu pour maintenance, mise à jour ou raison technique, sans préavis garanti.",
          ],
        },
      ],
    },
    {
      id: "responsabilite",
      heading: "7. Responsabilité",
      blocks: [
        {
          kind: "p",
          text: "L'éditeur met en œuvre les moyens raisonnables pour que l'application soit fiable et disponible, sans garantir l'absence d'erreur ni une continuité ininterrompue. Il ne répond pas des conséquences d'une saisie erronée, d'un partage d'identifiants, d'une perte de données non synchronisées, ni d'une défaillance du réseau ou de l'appareil utilisé.",
        },
        {
          kind: "p",
          text: "Les montants, soldes et rapports produits par l'application sont des aides à la décision. Ils ne dispensent pas des vérifications comptables d'usage.",
        },
      ],
    },
    {
      id: "suspension",
      heading: "8. Suspension et fin d'accès",
      blocks: [
        {
          kind: "p",
          text: "La direction de la ferme peut suspendre ou retirer un accès en cas de manquement à ces conditions, de risque pour la sécurité des données, ou à la fin de la relation de travail. Le retrait d'un droit prend effet immédiatement. Les écritures déjà enregistrées sous ce compte sont conservées, pour les raisons de traçabilité exposées dans la politique de confidentialité.",
        },
      ],
    },
    {
      id: "donnees-perso",
      heading: "9. Données personnelles et traceurs",
      blocks: [
        {
          kind: "p",
          text: "Le traitement des données personnelles est décrit dans la politique de confidentialité. L'usage des cookies et des stockages locaux est décrit dans la politique de cookies. Ces deux documents font partie intégrante des présentes conditions.",
        },
      ],
    },
    {
      id: "droit",
      heading: "10. Droit applicable et modifications",
      blocks: [
        {
          kind: "p",
          text: "Ces conditions sont soumises au droit malgache. Tout litige relève des juridictions compétentes de Madagascar, après recherche d'une solution amiable.",
        },
        {
          kind: "p",
          text: "Elles peuvent être modifiées pour suivre les évolutions de l'application ou de la réglementation. La date de dernière mise à jour figure en tête de page ; la poursuite de l'utilisation après modification vaut acceptation.",
        },
      ],
    },
  ],
}

// ---------------------------------------------------------------------------
// Politique de cookies
// ---------------------------------------------------------------------------

export const COOKIE_POLICY: LegalDocumentContent = {
  slug: "cookies",
  title: "Politique de cookies",
  description:
    "Quels cookies et stockages locaux AgriConnect utilise, lesquels sont indispensables, et comment modifier votre choix à tout moment.",
  lead:
    "AgriConnect n'utilise aucun cookie publicitaire et ne profile personne. L'application s'appuie surtout sur le stockage local de votre navigateur, qui ne quitte pas votre appareil. Ce document liste précisément ce qui est déposé, et ce que vous pouvez refuser.",
  sections: [
    {
      id: "definitions",
      heading: "1. Cookies et stockage local",
      blocks: [
        {
          kind: "p",
          text: "Un cookie est un petit fichier déposé par un site et renvoyé au serveur à chaque requête. Le stockage local (localStorage, sessionStorage) est un espace du navigateur que le site lit et écrit, mais qui n'est jamais transmis automatiquement.",
        },
        {
          kind: "p",
          text: "AgriConnect utilise essentiellement le stockage local. C'est ce qui lui permet de fonctionner sans réseau. Ces informations restent sur votre appareil : elles ne sont ni partagées entre utilisateurs, ni lisibles par la ferme, et disparaissent si vous effacez les données du navigateur.",
        },
      ],
    },
    {
      id: "essentiels",
      heading: "2. Traceurs essentiels — sans consentement",
      blocks: [
        {
          kind: "p",
          text: "Ces éléments sont indispensables au fonctionnement du service. Les refuser reviendrait à empêcher l'application de fonctionner, c'est pourquoi ils ne sont pas soumis au consentement.",
        },
        {
          kind: "table",
          caption: "Traceurs essentiels déposés par AgriConnect",
          columns: ["Élément", "Rôle", "Durée"],
          rows: [
            [
              "agriconnect-auth",
              "Maintient votre session ouverte. Placé dans le stockage de session si vous n'avez pas coché « se souvenir de moi ».",
              "Jusqu'à la déconnexion, ou à la fermeture du navigateur.",
            ],
            ["agriconnect-remember-me", "Mémorise si votre session doit survivre à la fermeture du navigateur.", "Jusqu'à la déconnexion."],
            ["agriconnect-lang", "Conserve la langue choisie (français, anglais, malgache).", "Persistant."],
            ["agriconnect-theme, agriconnect-appearance", "Thème clair ou sombre, densité d'affichage, animations.", "Persistant."],
            [
              "agriconnect-offline",
              "File d'attente des saisies effectuées hors connexion, en attente de synchronisation.",
              "Jusqu'à la synchronisation.",
            ],
            [
              "Données de travail (production, stock, clients, etc.)",
              "Copie locale permettant de consulter et de saisir sans réseau.",
              "Jusqu'à l'effacement des données du navigateur.",
            ],
            [
              "agriconnect-cookie-consent",
              "Mémorise votre choix sur les traceurs non essentiels, pour ne pas vous le redemander.",
              "6 mois.",
            ],
          ],
        },
      ],
    },
    {
      id: "mesure",
      heading: "3. Traceurs de mesure — soumis à votre consentement",
      blocks: [
        {
          kind: "p",
          text: "La ferme peut activer un outil de supervision technique (Sentry) qui remonte les erreurs rencontrées dans l'application, afin de les corriger. Il enregistre le type d'erreur, la page concernée, et des informations techniques sur le navigateur.",
        },
        {
          kind: "ul",
          items: [
            "Il n'est chargé qu'après votre acceptation. Tant que vous n'avez pas répondu au bandeau, il ne s'exécute pas.",
            "Il est configuré pour ne pas transmettre le contenu des formulaires ni les identifiants personnels.",
            "Le refuser n'enlève aucune fonctionnalité : il ne sert qu'à la qualité du logiciel.",
          ],
        },
        {
          kind: "p",
          text: "Si la supervision n'est pas activée par la ferme, aucun traceur de mesure n'est déposé, quel que soit votre choix.",
        },
      ],
    },
    {
      id: "absents",
      heading: "4. Ce qu'AgriConnect ne fait pas",
      blocks: [
        {
          kind: "ul",
          items: [
            "Aucun cookie publicitaire, aucune régie, aucun pixel de suivi.",
            "Aucun profilage ni revente de données.",
            "Aucun traceur de réseau social.",
            "Aucun suivi de votre navigation sur d'autres sites.",
          ],
        },
      ],
    },
    {
      id: "choix",
      heading: "5. Gérer votre choix",
      blocks: [
        {
          kind: "p",
          text: "Au premier accès, un bandeau vous permet d'accepter, de refuser, ou de choisir catégorie par catégorie. Votre décision est conservée six mois, puis vous est redemandée.",
        },
        {
          kind: "ul",
          items: [
            "Vous pouvez la modifier à tout moment depuis le lien « Préférences de cookies » en pied de page.",
            "Refuser les traceurs de mesure n'empêche ni la connexion, ni la saisie, ni le fonctionnement hors ligne.",
            "Votre navigateur permet aussi de bloquer ou d'effacer cookies et stockage local. Effacer le stockage local déconnecte la session et supprime les saisies non encore synchronisées.",
          ],
        },
      ],
    },
    {
      id: "contact",
      heading: "6. Contact",
      blocks: [
        {
          kind: "p",
          text: `Pour toute question sur ce document ou sur l'usage des traceurs, écrivez à ${OPERATOR.email}. Le traitement de vos données personnelles est détaillé dans la politique de confidentialité.`,
        },
      ],
    },
  ],
}

export const LEGAL_DOCUMENTS = [PRIVACY_POLICY, TERMS_OF_USE, COOKIE_POLICY] as const
