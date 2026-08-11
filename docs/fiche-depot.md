# Fiche du dépôt

Aide-mémoire pour le travail de tous les jours.

Les **règles** — nommage des branches, format des commits, trajet d'une carte — sont
dans [CONTRIBUTING.md](../CONTRIBUTING.md). L'**installation** est dans le
[README](../README.md). Cette fiche ne les répète pas : elle donne les gestes, et
surtout la conduite à tenir quand Git refuse quelque chose.

## Comment le dépôt est verrouillé

`main` et `dev` sont protégées sur GitHub. Ce n'est pas une convention qu'on peut
oublier : c'est le serveur qui refuse.

| Verrou | Effet concret |
|---|---|
| Demande de fusion obligatoire | `git push` sur `main` ou `dev` est **rejeté**, pour tout le monde |
| Applicable aux administrateurs | y compris pour le superviseur — personne n'a de passe-droit |
| Force push interdit | `git push --force` est rejeté : l'historique commun ne peut pas être réécrit |
| Suppression interdite | les deux branches ne peuvent pas être supprimées par accident |
| Conversations à résoudre | toute remarque de relecture doit être traitée avant la fusion |

La configuration est versionnée dans [`branch-protection.json`](../branch-protection.json).

## Le cycle d'une carte, en commandes

```bash
git switch dev
git pull
git switch -c feat/12-mouvements-stock
```

Travaillez, puis committez petit et souvent :

```bash
git add -p
git commit -m "feat(stock): ajouter le calcul du stock restant"
```

Publiez la branche, la première fois seulement :

```bash
git push -u origin feat/12-mouvements-stock
```

Les fois suivantes, `git push` suffit. Ouvrez ensuite la demande de fusion **vers
`dev`** depuis GitHub, faites relire par un autre stagiaire, fusionnez en *squash*,
supprimez la branche. Puis revenez sur `dev` :

```bash
git switch dev
git pull
```

## Quand ça coince

| Ce que Git affiche | Ce qui se passe | Quoi faire |
|---|---|---|
| `protected branch hook declined` | Vous poussez sur `main` ou `dev` | Vous n'êtes pas sur votre branche. `git switch -c <branche>` puis repoussez |
| `Updates were rejected... behind` | Quelqu'un a poussé avant vous | `git pull` puis repoussez. Jamais `--force` |
| `CONFLICT (content)` | Deux personnes ont touché les mêmes lignes | Ouvrez le fichier, gardez la bonne version, supprimez les marqueurs `<<<<`, `====`, `>>>>`, puis `git add` et `git commit` |
| `no history in common` | Les deux branches n'ont aucune racine commune | Ne devrait plus arriver — signalez dans `#socle-technique` |
| Votre branche a plus d'une semaine | Elle diverge trop de `dev` | `git switch dev && git pull && git switch - && git merge dev`, résolvez, puis ouvrez la fusion sans attendre |

## Vérifier où vous en êtes

```bash
git status
```

```bash
git branch -vv
```

`git status` doit être vide avant de changer de branche. `git branch -vv` montre
chaque branche, son homologue distant et son retard éventuel.

Pour voir ce que votre branche ajoute réellement par rapport à `dev` — à faire avant
d'ouvrir une demande de fusion, cela évite les surprises en relecture :

```bash
git diff dev --stat
```

## Trois réflexes

1. **Toujours partir de `dev` à jour.** Une branche créée depuis une `dev` périmée
   fusionne mal.
2. **Ne jamais forcer.** `--force` et `--hard` détruisent du travail — le vôtre ou
   celui des autres. En cas de doute, demandez avant.
3. **Pousser tous les jours.** Une branche qui n'existe que sur votre machine est un
   travail que personne ne peut récupérer si le portable lâche.
