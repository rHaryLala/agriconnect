# AgriConnect

Logiciel intégré de gestion de ferme : production agricole et animale, stocks, finances,
clients et fournisseurs, rapports.

Projet de stage — 5 semaines. Lesoa, Siméon et Voahary, sous la supervision de Hary Lala Rabenamana.

## Prérequis

- Node.js 20 ou plus
- Docker Desktop
- Git

## Démarrer en trois commandes

```bash
cp .env.example .env       # puis remplissez JWT_SECRET
docker compose up -d       # démarre PostgreSQL
npm install
```

Vérifier que la base répond :

```bash
docker compose ps
```

La colonne `STATUS` doit afficher `healthy`. Si ce n'est pas le cas, consultez les
journaux avec `docker compose logs db`.

## Pile technique

| Couche | Technologie |
|---|---|
| Front | React + Vite + TypeScript |
| Interface | Tailwind CSS + shadcn/ui |
| Données serveur | TanStack Query |
| Formulaires | React Hook Form + Zod (schémas partagés avec l'API) |
| Graphiques | Recharts |
| Back | NestJS + Prisma |
| Base | PostgreSQL 16 |
| Hors-ligne | PWA (vite-plugin-pwa) + file d'attente Dexie.js |
| Rapports | jsPDF-autotable et ExcelJS, côté navigateur |

## Conventions

Branches, commits et relecture : voir [CONTRIBUTING.md](CONTRIBUTING.md).
Ces règles ne sont pas décoratives — elles sont vérifiées à chaque demande de fusion.

## Liens

- Tableau Trello : https://trello.com/b/1bkzEIsa/gestion-des-industries
- Discord : salon `#socle-technique` pour tout ce qui touche à ce dépôt
- Maquette Figma : voir `#liens-du-projet`

## Règle de sécurité

Aucun mot de passe, clé ou jeton ne se trouve dans ce dépôt. Tout secret vit dans
un fichier `.env` local, exclu par `.gitignore`.

Un secret poussé une fois reste dans l'historique Git **même après suppression du
fichier**. En cas d'accident : prévenez immédiatement dans `#socle-technique`,
révoquez le secret concerné, puis générez-en un nouveau.
