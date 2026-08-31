# Rapport d'avancement automatique

`docs/avancement.html` est **généré**, jamais édité à la main. Toute modification
directe du HTML sera écrasée à la prochaine exécution.

## Régénérer

```bash
node scripts/rapport-avancement.mjs
```

Le script ne dépend de rien d'autre que Node et Git. Il lit l'historique de toutes
les branches, y compris celles qui ne sont pas fusionnées.

**Il récupère le dépôt distant lui-même** (`git fetch --all --prune`) avant de
compter quoi que ce soit. Sans cela le rapport décrirait le cache de votre machine
et non l'état réel de GitHub : un commit poussé il y a deux minutes n'y figurerait
pas, sans que rien ne le signale.

Hors ligne, ou pour éviter l'appel réseau :

```bash
node scripts/rapport-avancement.mjs --sans-fetch
```

Le rapport porte alors un avertissement en pied de page, et le script le rappelle
sur la sortie standard. Même chose si le dépôt distant est injoignable : la
génération aboutit, mais elle le dit.

Si la commande `gh` est installée et authentifiée, le script compte aussi les
demandes de fusion. Sinon il s'exécute quand même, et le signale en pied de page.

## Ce qui se recalcule

Les chiffres, mais aussi les commentaires. Le titre, les verdicts par stagiaire,
les risques et les actions recommandées sont déduits de seuils appliqués aux
données réelles — rien n'est écrit en dur :

| Élément | Ce qui le déclenche |
|---|---|
| Titre et chapeau | Nombre de fichiers applicatifs présents sur `dev` |
| Verdict d'un stagiaire | Volume, modules, et jours écoulés depuis son dernier commit |
| Risque « sans ancêtre commun » | `git merge-base` ne renvoie rien entre `dev` et la branche |
| Risque « schémas concurrents » | Plusieurs `prisma/schema.prisma` de contenus différents |
| Risque « branche trop vieille » | Plus ancien commit non intégré au-delà de `AGE_BRANCHE_MAX` |
| Risque « aucune relecture » | Aucune demande de fusion issue d'une branche de stagiaire |
| Risque « conventions » | Moins de 70 % des messages au format `type(domaine):` |
| Actions recommandées | Déduites des risques présents, dans l'ordre où elles débloquent le reste |

Quand un risque disparaît, sa ligne disparaît, et l'action correspondante aussi.

## Réglages

En tête de `scripts/rapport-avancement.mjs` :

- `EQUIPE` — noms, rôles, branches et **adresses de courriel**. Un stagiaire qui
  commite depuis une nouvelle adresse doit être ajouté ici, sinon ses commits ne
  sont comptés pour personne.
- `SILENCE_ALERTE` — jours sans commit avant signalement (3 par défaut).
- `AGE_BRANCHE_MAX` — durée de vie maximale d'une branche (7 jours, comme
  [CONTRIBUTING.md](../CONTRIBUTING.md)).
- `DEBUT_STAGE` et `DUREE_SEMAINES` — bornes du stage.

## Régénération automatique

`.github/workflows/avancement.yml` s'exécute dans trois cas :

| Déclencheur | Effet |
|---|---|
| **Tous les jours à 18h00** (heure de Madagascar) | Régénère et **committe sur la branche `rapport`** |
| À chaque poussée | Régénère et dépose le fichier en pièce jointe du workflow |
| Manuellement (bouton *Run workflow*) | Comme la version quotidienne |

Le cron est écrit `0 15 * * *` : GitHub planifie en UTC, et Madagascar est à
UTC+3 sans heure d'été — 18h00 locale vaut donc 15h00 UTC toute l'année.

### Pourquoi une branche `rapport` et pas `dev`

`dev` et `main` exigent une demande de fusion approuvée, `enforce_admins`
compris. Le jeton d'Actions n'a aucun passe-droit, et sur un dépôt personnel il
n'existe pas de liste d'exception qui prime sur ce réglage. Committer le rapport
sur `dev` supposerait d'affaiblir la protection.

La branche `rapport` n'est pas protégée et ne sert qu'à cela. Elle porte
l'historique quotidien du rapport sans encombrer l'historique du code, et sans
déclencher de nouvelle exécution du workflow — les poussées sur `rapport` sont
explicitement exclues.

### Commits inutiles évités

Le script écrit aussi `docs/avancement.json`, une sortie de données dont sont
absentes les grandeurs qui dépendent du jour de calcul : horodatage, jours de
silence, semaine de stage. Le workflow ne committe que si **ce fichier** a
changé. Un jour sans activité sur le dépôt ne produit donc aucun commit.

### Aller plus loin

Pour une adresse permanente plutôt qu'une pièce jointe, activez GitHub Pages sur
la branche `rapport`, dossier `/docs` : `Settings → Pages`. Le rapport y sera
publié à chaque commit quotidien.

### En local, à chaque commit

Pour l'avoir à jour sur votre machine sans passer par GitHub :

```bash
printf '#!/bin/sh\nnode scripts/rapport-avancement.mjs\n' > .git/hooks/post-commit
```

```bash
chmod +x .git/hooks/post-commit
```

Les crochets Git ne sont pas versionnés : chacun l'installe chez soi.
