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

`.github/workflows/avancement.yml` régénère le rapport à chaque poussée sur
n'importe quelle branche, plus une fois par jour en semaine — de sorte qu'un
stagiaire silencieux finisse par apparaître même sans nouvelle poussée. Le
fichier est déposé en pièce jointe du workflow, onglet **Actions**, conservé
30 jours.

Le workflow ne committe rien : les branches sont protégées, et un rapport qui
se committe lui-même polluerait l'historique à chaque poussée.

### En local, à chaque commit

Pour l'avoir à jour sur votre machine sans passer par GitHub :

```bash
printf '#!/bin/sh\nnode scripts/rapport-avancement.mjs\n' > .git/hooks/post-commit
```

```bash
chmod +x .git/hooks/post-commit
```

Les crochets Git ne sont pas versionnés : chacun l'installe chez soi.
