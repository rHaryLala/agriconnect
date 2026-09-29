# Conventions de travail

## Branches

Deux branches permanentes, protégées — personne n'y pousse directement :

- **`main`** — uniquement du code qui tourne et se démontre. On y fusionne `dev` aux jalons.
- **`dev`** — branche d'intégration où les trois travaux se rejoignent.

Une branche de travail par carte Trello, créée depuis `dev`, supprimée après fusion.
Elle ne vit pas plus d'une semaine.

```
<type>/<n° de la carte Trello>-<résumé en trois mots>
```

```
feat/8-poules-pondeuses
feat/12-mouvements-stock
fix/13-total-depenses
docs/5-modele-de-donnees
```

Minuscules, tirets, pas d'accents : certains outils Git les gèrent mal.
Le numéro de carte est le fil conducteur — depuis un commit on retrouve la carte,
depuis la carte on retrouve le code.

## Commits

```
<type>(<domaine>): <action à l'infinitif>
```

```
feat(stock): ajouter le calcul du stock restant
feat(production): enregistrer la ponte quotidienne des pondeuses
fix(finance): corriger le total des dépenses mensuelles
refactor(socle): extraire le calcul des mouvements de stock
```

À proscrire : `maj`, `correction bug + ajout page + tests`.

| Type | Quand l'utiliser |
|---|---|
| `feat` | Une fonctionnalité que l'exploitant peut voir ou utiliser |
| `fix` | Une correction sur du code déjà fusionné |
| `refactor` | Le code change, le comportement non |
| `docs` | Cahier des charges, modèle de données, manuel, commentaires |
| `test` | Ajout ou correction de tests |
| `chore` | Configuration, dépendances, `.gitignore` |

Domaines : `production`, `stock`, `finance`, `tiers`, `transactions`, `rapports`, `socle`.

Verbe à l'infinitif, minuscule, sans point final, sous 72 caractères.
Un commit porte une seule idée : s'il faut écrire « et » dans le message, il en fallait deux.
Committez au moins une fois par séance — un dépôt sans commit depuis quatre jours
est un travail qu'on ne peut pas récupérer.

## Le trajet d'une carte

1. Déplacer la carte Trello dans **En cours** — avant d'écrire la moindre ligne
2. Créer la branche depuis `dev` à jour :
   `git switch dev && git pull && git switch -c feat/12-mouvements-stock`
3. Committer petit et souvent
4. Ouvrir une demande de fusion vers `dev` — titre = nom de la carte,
   description = lien Trello et ce qu'il faut tester pour vérifier
5. Faire relire par **un autre stagiaire**. Une relecture en attente depuis plus
   de 24 h se réclame dans `#entraide`
6. Fusionner en *squash*, puis supprimer la branche
7. Déplacer la carte selon la définition de « Terminé » ci-dessous

## Quatre interdits

1. **Aucun push direct sur `main` ni `dev`.** La protection est active dès la création du dépôt.
2. **Aucun identifiant dans le dépôt.** Mots de passe et clés vivent dans `.env`.
   Un secret poussé une fois reste dans l'historique même après suppression.
3. **Aucun fichier généré.** Dépendances, exports PDF et Excel, sauvegardes : tout
   cela se régénère et alourdit le dépôt.
4. **Aucune branche qui traîne.** Au-delà d'une semaine, elle diverge trop de `dev`
   et la fusion devient douloureuse. Une carte trop grosse pour une semaine est une
   carte à découper.

## Définition de « Terminé »

> À écrire par l'équipe — voir la carte Trello « Définir Terminé ».
> Tant que cette section est vide, la colonne Terminé ne veut rien dire.

<!-- Remplacez ce bloc par votre définition, puis épinglez-la dans #général. -->
