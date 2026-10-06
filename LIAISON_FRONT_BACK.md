# Liaison front ↔ backend — état au 6 octobre 2026

`VITE_USE_MOCK_API=false` : l'API réelle est appelée, avec repli automatique sur
les données locales si le serveur est injoignable ou répond en 5xx. Un 4xx
remonte à l'appelant — c'est une réponse du serveur, pas une panne.

> **Aucune liaison n'a été vérifiée contre l'API réelle.** Le backend n'était
> joignable ni sur `localhost:3000` ni sur `192.168.0.232:3000`, et il ne compile
> pas en l'état (13 erreurs TypeScript). Tout est à reprendre dès qu'une instance
> démarre.

## Lié

| Domaine | Routes | Séquelle assumée |
|---|---|---|
| `auth` | `POST /auth/login`, `GET /auth/me` | — |
| `users` | `GET/POST/PATCH/DELETE /users` | `status` est une valeur par défaut, le champ n'existe pas en base |
| `dashboard` | `GET /dashboard` | le contrôleur ne couvre que 3 des indicateurs affichés ; le reste vient des données de démonstration (`champsReels` dit lesquels sont réels) |
| `stock` | `GET/POST /stock/items`, `GET /stock/historique`, `POST /stock/items/:id/movements` | emplacement figé au défaut ; `numeroBon`, `montant`, `destinataire` restent locaux ; `updateMovement` reste local (le backend corrige par écriture inverse) |
| `bovins` | `GET/POST /cattle`, `POST /cattle/:id/sell`, `/death` | `clientId` obligatoire à la vente : sans client le serveur répond 400 |
| volailles (Kuroiler) | `GET/POST /poultry`, `POST /poultry/:id/exit`, `/weekly-records` | une requête par animal pour les relevés ; statut « perdue » retombe sur `DECEDE` |

## Corrigé côté backend

- `CreateStockDto.category` rendue optionnelle, défaut appliqué dans le service.
  Le front n'a pas cette notion ; l'exiger revenait à inventer une valeur.
- `CreateProductionDto` accepte `cattleId` et `poultryTrackingId`. Les colonnes
  existaient et étaient migrées, seul le DTO les bloquait.

## À demander au DBA

| Demande | Débloque |
|---|---|
| `User.status` + enum (`ACTIF`/`INACTIF`/`SUSPENDU`) | suspension de compte ; aujourd'hui `DELETE /users/:id` renvoie 409 dès que le compte a saisi quelque chose, et c'est la seule issue |
| `Transaction.categorie` | le module Finance : tous ses filtres en dépendent |
| Relevé de traite par vache (modèle, ou champs `matin`/`soir`) | la saisie du lait matin/soir, aujourd'hui écrasée dans un `quantity` unique |
| **Migration des ajouts postérieurs au 22/09** | tout le reste de cette colonne — voir ci-dessous |

### Migration manquante — bloque le plus gros

Le schéma a été enrichi, la migration non. Objets déclarés mais **absents de la
base** :

- tables `LaborActivity`, `LaborLog`, `PaddyDryingWave`, `PaddyMilling`
- `PaddyProcess` : `driedPaddyKg`, `harvestDate`, `transport`, `driverName`, `storekeeperName`, `userId`
- `StockMovement` : `cultureType`, `parcel`, `equipment`, `voucherNumber`
- `Supplier` : `category`, `status`, `rating`, `paymentTermDays`, `products`
- `SupplierPurchase` : `description`, `status`, `farmId`
- `SupplierPayment` : `userId`

## Non lié — raison exacte

| Domaine | Raison |
|---|---|
| `production` (fiches journalières) | La table `Production` est plate (`type`, `quantity`, `unit`, `date`). Les fiches front portent `cages[]` (effectif par cage), `alimentsKg` et `mortalite` par jour : aucun équivalent. Une fiche s'écrirait en 6 lignes et se relirait sans les cages ni l'aliment — perte de données à chaque enregistrement. |
| `labor`, `paddy` | tables non migrées (voir ci-dessus) |
| engrais, carburant | les 4 colonnes d'attribution de `StockMovement` ne sont pas migrées |
| `suppliers` | 9 colonnes non migrées sur les trois tables ; le contrôleur casserait au premier appel |
| `product-variants` | Contrôleur fonctionnel, mais rien à lier : les seules données front de forme « variante » sont les prix d'œufs et les haricots, et la correspondance catégorie ↔ variante n'a aucune source de vérité (ni article identifié, ni convention de nommage). Décision de données, pas de code. |
| `reports` | `pdfkit` et `exceljs` ne sont pas installés côté backend : le module ne compile pas. L'export PDF/Excel du front reste la seule voie fonctionnelle. |
| `stock-transfer` | table `StockLocation` migrée, mais aucune route ne l'expose et aucune ligne n'est semée |
| `clients`, `transactions` | contrôleurs présents, mais `ClientsModule` et `TransactionsModule` ne sont pas dans `app.module` : les routes n'existent pas. Zéro garde sur les deux. Fusion en cours côté collègue. |
| `employee` | `EmployeeController` est un stub vide ; le service existe, les routes non. Travail en cours côté collègue. |
| `finance` | pas de `Transaction.categorie` |
| `personnel`, factures | dépendent de `employee` et de la chaîne de facturation |

## Point de vigilance

Le repli mock s'applique aussi à la **connexion** : serveur indisponible, les
identifiants de démonstration ouvrent une session. C'est le filet demandé pour
cette phase, mais il doit disparaître avant toute mise en production — sinon une
panne du backend devient une porte d'entrée.
