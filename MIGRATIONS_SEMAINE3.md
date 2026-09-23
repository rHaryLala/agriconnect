# Semaine 3 — migration à lancer

Les modifications de `prisma/schema.prisma` de la Semaine 3 sont committées mais
**aucune migration n'a été générée ni appliquée**. Le code ne tournera pas tant
que cette migration n'est pas passée.

Contexte : l'historique de migrations vit sur `feature/database`
(`20260922133335_add_cattle_and_poultry_to_production`), pas sur
`feature/backend` qui n'a que l'init. Générer une migration ici depuis une base
qui n'a que `Farm` et `User` produirait une deuxième lignée incompatible.

## Ordre à suivre

1. ~~Rapatrier la migration de `feature/database`~~ — **fait**
   (`20260922133335_add_cattle_and_poultry_to_production`, commit `6a5b906`).
   Lignée vérifiée compatible avant copie : même migration init et même
   `migration_lock.toml` des deux côtés, donc simple ajout en fin d'historique.
   `package.json` et `prisma.config.ts` n'ont pas été touchés, le conflit entre
   les deux branches est évité.
2. Créer un `.env` avec `DATABASE_URL` — il n'y en a pas dans le dépôt.
3. `npx prisma migrate deploy` — applique l'existant.
4. `npx prisma migrate dev --name semaine3_paddy_labor_attribution` — génère la
   migration des ajouts ci-dessous.
5. Seed : le `prisma/seed.ts` local ne crée qu'une ferme et trois utilisateurs,
   avec des mots de passe en clair. Celui de `feature/database` couvre toutes
   les tables et hache les mots de passe. Pour le récupérer :
   `git checkout origin/feature/database -- prisma/seed.ts` — il faudra aussi
   ajouter `seed: "npx tsx prisma/seed.ts"` dans `prisma.config.ts`.

## Ce que la migration doit créer

**Riziculture**
- table `PaddyDryingWave` (vagues de séchage : PASSAGE / FINALISATION)
- table `PaddyMilling` (décorticage)
- enum `DryingEventType`
- sur `PaddyProcess` : `driedPaddyKg`, `harvestDate`, `transport`, `driverName`,
  `storekeeperName`, `userId` (NOT NULL), contrainte `@@unique([farmId, lotNumber])`

**Main d'œuvre**
- tables `LaborActivity` et `LaborLog`

**Attribution des mouvements de stock**
- enum `CultureType` (RIZ, HARICOT, MAIS, MIMOSA, MARAICHERE)
- sur `StockMovement` : `cultureType`, `parcel`, `equipment`, `voucherNumber`

## Point de vigilance

`PaddyProcess.userId` est **non nullable**. Si des lots existent déjà en base,
la migration échouera sans valeur par défaut. Deux options : vider la table si
elle ne contient que des données de test, ou ajouter la colonne en nullable puis
la remplir avant de la contraindre.

## Bloqué — en attente du module Transaction

Le collègue développe Invoice / Payment / SalaryDeduction. Rien n'a été écrit
dessus, conformément à la consigne. En attente :

- **Vente du riz décortiqué** (CDC 2.1.5) — numéro de reçu + retenue sur salaire.
  Marqué TODO dans `src/paddy/paddy.service.ts` et `src/paddy/paddy.controller.ts`.
  Le riz est déjà en stock via `addMilling()`, donc la vente sera un mouvement
  `OUT` sur l'article « Riz décortiqué » plus une facture. Aucune table paddy
  supplémentaire ne devrait être nécessaire.
- **Vente des haricots** — même chaîne, même attente. Le stock par variante
  existe déjà.

## Anomalies préexistantes non corrigées

Six erreurs TypeScript bloquent `nest build` sur la branche, toutes antérieures
à la Semaine 3 et hors de son périmètre. Non touchées pour ne pas entrer en
conflit avec le travail de Semaine 4 en cours :

- `src/stock/stock.service.ts:171` — `originalMovmentId` au lieu de
  `originalMovementId` (faute de frappe, le champ a été renommé au schéma).
- `src/finance/finance.service.ts:84,123` et `src/dashboard/dashboard.service.ts:49`
  — arithmétique directe sur des `Decimal` Prisma, qui ne sont pas des `number`.
  Conséquence du passage des montants en `Decimal(14,2)`.

Le premier est un bug réel : la correction de mouvement n'enregistre pas son
lien vers le mouvement d'origine.
