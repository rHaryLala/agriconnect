# Fiche du dépôt

Guide d'utilisation de ce dépôt, pensé pour être lu du début à la fin une première
fois, puis consulté par section.

Les **règles** — nommage des branches, format des commits, trajet d'une carte — sont
dans [CONTRIBUTING.md](../CONTRIBUTING.md). L'**installation du projet** est dans le
[README](../README.md). Cette fiche-ci explique comment se servir de Git au quotidien
sur ce dépôt précis.

---

## 1. Une fois pour toutes

À faire une seule fois, sur votre machine.

Dites à Git qui vous êtes — ce nom apparaîtra sur chacun de vos commits :

```bash
git config --global user.name "Prenom Nom"
```

```bash
git config --global user.email "votre.email@exemple.com"
```

Utilisez la **même adresse que votre compte GitHub**, sinon vos commits ne vous
seront pas attribués sur le tableau de bord.

Récupérez le dépôt :

```bash
git clone https://github.com/rHaryLala/agriconnect.git
```

```bash
cd agriconnect
```

Vérifiez que tout est en place :

```bash
git config --list
```

```bash
git remote -v
```

`git remote -v` doit afficher `origin` pointant vers `github.com/rHaryLala/agriconnect`.
`origin` est le surnom du dépôt distant : quand vous tapez `origin`, vous parlez de GitHub.

---

## 2. Les six mots à connaître

Sans ce vocabulaire, les messages d'erreur de Git sont incompréhensibles.

| Mot | Ce que c'est |
|---|---|
| **Dépôt** | Le dossier du projet, plus tout son historique |
| **Commit** | Une photo de l'état du projet à un instant, avec un message qui l'explique |
| **Branche** | Une ligne de commits indépendante, pour travailler sans gêner les autres |
| **Index** | La zone d'attente : ce que vous avez choisi de mettre dans le prochain commit |
| **`origin`** | Le dépôt distant sur GitHub, partagé par tout le monde |
| **`HEAD`** | Là où vous êtes en ce moment : la branche et le commit courants |

Un fichier modifié passe par trois états, dans cet ordre :

```
modifié  ──git add──▶  dans l'index  ──git commit──▶  enregistré  ──git push──▶  sur GitHub
```

Tant que vous n'avez pas fait `git push`, votre travail n'existe **que sur votre
machine**. Personne ne peut le voir, et personne ne peut le récupérer si votre
portable tombe en panne.

---

## 3. Comment le dépôt est verrouillé

`main` et `dev` sont protégées sur GitHub. Ce n'est pas une convention qu'on peut
oublier : c'est le serveur qui refuse.

| Verrou | Effet concret |
|---|---|
| Demande de fusion obligatoire | `git push` sur `main` ou `dev` est **rejeté**, pour tout le monde |
| Applicable aux administrateurs | y compris pour le superviseur — personne n'a de passe-droit |
| Force push interdit | `git push --force` est rejeté : l'historique commun ne peut pas être réécrit |
| Suppression interdite | les deux branches ne peuvent pas être supprimées par accident |
| Conversations à résoudre | toute remarque de relecture doit être traitée avant la fusion |

À retenir : **vous ne travaillez jamais directement sur `main` ni sur `dev`.**
Vous créez une branche, vous y travaillez, vous ouvrez une demande de fusion.

La configuration est versionnée dans [`branch-protection.json`](../branch-protection.json).

---

## 4. Le cycle d'une carte, du début à la fin

C'est la séquence à connaître par cœur. Tout le reste de la fiche n'est que du détail
autour d'elle.

**Partir de `dev` à jour.** Une branche créée depuis une `dev` périmée fusionnera mal :

```bash
git switch dev
```

```bash
git pull
```

**Créer votre branche** (nom : voir [CONTRIBUTING.md](../CONTRIBUTING.md)) :

```bash
git switch -c feat/12-mouvements-stock
```

**Travailler, puis enregistrer** — petit et souvent, plusieurs fois par séance :

```bash
git status
```

```bash
git add -p
```

```bash
git commit -m "feat(stock): ajouter le calcul du stock restant"
```

**Publier la branche.** La première fois, avec `-u` :

```bash
git push -u origin feat/12-mouvements-stock
```

Les fois suivantes, `git push` tout court suffit.

**Vérifier avant de faire relire** — ce que votre branche ajoute vraiment par rapport
à `dev`. Cela évite les mauvaises surprises en relecture :

```bash
git diff dev --stat
```

**Ouvrir la demande de fusion vers `dev`** sur GitHub, faire relire par un autre
stagiaire, fusionner en *squash*, supprimer la branche.

**Revenir sur `dev`** et récupérer votre travail fusionné :

```bash
git switch dev
```

```bash
git pull
```

```bash
git branch -d feat/12-mouvements-stock
```

La dernière commande supprime la copie locale de la branche, devenue inutile.

---

## 5. Enregistrer son travail

| Commande | Ce qu'elle fait |
|---|---|
| `git status` | Où j'en suis : fichiers modifiés, en attente, branche courante |
| `git diff` | Ce que j'ai changé et qui n'est **pas** encore dans l'index |
| `git diff --staged` | Ce qui est dans l'index, prêt à être committé |
| `git add <fichier>` | Mettre un fichier précis dans l'index |
| `git add -p` | Choisir **morceau par morceau** ce qui entre dans l'index |
| `git add .` | Tout mettre dans l'index — pratique, mais on committe vite des choses non voulues |
| `git commit -m "..."` | Enregistrer l'index dans un commit |
| `git commit -v` | Pareil, mais ouvre un éditeur en montrant le diff — utile pour rédiger un bon message |

Préférez `git add -p` à `git add .`. Git vous montre chaque modification et vous
demandez `y` (oui), `n` (non) ou `q` (quitter). C'est le meilleur moyen de faire des
commits qui portent **une seule idée**, comme l'exige `CONTRIBUTING.md`.

---

## 6. Se déplacer entre les branches

| Commande | Ce qu'elle fait |
|---|---|
| `git branch` | Lister mes branches locales |
| `git branch -vv` | Idem, avec le dernier commit et le retard sur `origin` |
| `git switch <branche>` | Aller sur une branche existante |
| `git switch -c <branche>` | Créer une branche et y aller |
| `git switch -` | Revenir à la branche précédente |
| `git branch -d <branche>` | Supprimer une branche déjà fusionnée |

`git status` doit être **vide** avant de changer de branche. Si vous avez du travail
en cours et devez changer, voir `git stash` en section 9.

---

## 7. Se synchroniser avec GitHub

| Commande | Ce qu'elle fait |
|---|---|
| `git fetch` | Télécharger les nouveautés **sans rien changer** chez moi |
| `git fetch --prune` | Idem, en supprimant les branches distantes qui n'existent plus |
| `git pull` | `fetch` + intégrer dans ma branche courante |
| `git push` | Envoyer mes commits sur `origin` |
| `git push -u origin <branche>` | Premier envoi d'une nouvelle branche |

`git fetch` est **toujours sans risque** : il regarde sans toucher à votre travail.
En cas de doute sur l'état du dépôt, commencez toujours par là.

---

## 8. Regarder l'historique

| Commande | Ce qu'elle fait |
|---|---|
| `git log --oneline -10` | Les 10 derniers commits, une ligne chacun |
| `git log --oneline --graph --all` | L'arbre des branches en dessin |
| `git log -p <fichier>` | L'historique d'un fichier, avec les modifications |
| `git show <commit>` | Le détail d'un commit précis |
| `git blame <fichier>` | Qui a écrit chaque ligne, et dans quel commit |
| `git diff dev` | Ce qui sépare ma branche de `dev` |

`git blame` sert à comprendre **pourquoi** une ligne existe en retrouvant son commit,
pas à désigner un coupable.

---

## 9. Corriger une erreur

Classées de la plus anodine à la plus dangereuse. **Lisez l'avertissement avant de
taper.**

**Mettre son travail de côté un instant** (pour changer de branche en urgence) :

```bash
git stash
```

```bash
git stash pop
```

`stash` range vos modifications en cours ; `pop` les remet. Rien n'est perdu.

**Retirer un fichier de l'index**, sans perdre les modifications :

```bash
git restore --staged <fichier>
```

**Corriger le dernier commit** — message mal écrit, ou fichier oublié :

```bash
git add <fichier-oublie>
```

```bash
git commit --amend
```

> ⚠️ Uniquement si le commit **n'a pas encore été poussé**. Après un `push`, `--amend`
> exigerait un `git push --force`, qui est bloqué sur ce dépôt — et qui casserait le
> travail des autres.

**Annuler un commit déjà poussé** — la méthode sûre. Git crée un nouveau commit qui
défait le précédent, sans réécrire l'histoire :

```bash
git revert <commit>
```

**Jeter ses modifications sur un fichier** et revenir au dernier commit :

```bash
git restore <fichier>
```

> ⚠️ **Destructif et sans retour.** Ce que vous n'aviez pas committé est perdu
> définitivement. Vérifiez avec `git diff` avant.

**Avoir committé sur la mauvaise branche** (typiquement sur `dev` par distraction) :

```bash
git switch -c la-bonne-branche
```

```bash
git switch dev
```

```bash
git reset --hard origin/dev
```

> ⚠️ La première commande emporte vos commits sur une nouvelle branche — **faites-la
> en premier**, sinon le `reset --hard` les détruit. En cas de doute, arrêtez-vous et
> demandez dans `#socle-technique` avant de taper la troisième ligne.

---

## 10. Résoudre un conflit

Un conflit arrive quand deux personnes ont modifié les mêmes lignes. Ce n'est pas une
faute, c'est normal. Git s'arrête et vous demande de trancher.

Mettez d'abord votre branche à jour depuis `dev` :

```bash
git switch dev
```

```bash
git pull
```

```bash
git switch -
```

```bash
git merge dev
```

Si Git annonce `CONFLICT`, listez les fichiers concernés :

```bash
git status
```

Ouvrez chaque fichier. Vous y trouverez ce genre de bloc :

```
<<<<<<< HEAD
le code de votre branche
=======
le code venant de dev
>>>>>>> dev
```

Gardez la bonne version — parfois les deux, dans le bon ordre — puis **supprimez les
trois lignes de marqueurs** `<<<<<<<`, `=======` et `>>>>>>>`. Ensuite :

```bash
git add <fichier-resolu>
```

```bash
git commit
```

Si vous êtes perdu en cours de route, vous pouvez toujours tout annuler et revenir à
l'état d'avant la fusion :

```bash
git merge --abort
```

Un conflit que vous ne savez pas trancher se demande dans `#entraide` : le code de
l'autre personne, c'est elle qui le comprend le mieux.

---

## 11. Quand ça coince

| Ce que Git affiche | Ce qui se passe | Quoi faire |
|---|---|---|
| `protected branch hook declined` | Vous poussez sur `main` ou `dev` | Vous n'êtes pas sur votre branche. Voir section 9, « mauvaise branche » |
| `Updates were rejected... behind` | Quelqu'un a poussé avant vous | `git pull`, puis repoussez. Jamais `--force` |
| `CONFLICT (content)` | Mêmes lignes modifiées des deux côtés | Section 10 |
| `nothing to commit, working tree clean` | Rien n'a changé depuis le dernier commit | Normal. Vos modifications sont peut-être déjà committées |
| `Please commit your changes or stash them` | Vous changez de branche avec du travail en cours | `git stash`, changez de branche, `git stash pop` |
| `fatal: not a git repository` | Vous n'êtes pas dans le dossier du projet | `cd agriconnect` |
| `no history in common` | Deux branches sans racine commune | Ne devrait plus arriver — signalez dans `#socle-technique` |
| Branche vieille de plus d'une semaine | Elle diverge trop de `dev` | Section 10, puis ouvrez la fusion sans attendre |

---

## 12. Ce qu'il ne faut jamais faire

1. **`git push --force`** — réécrit l'histoire commune et détruit le travail des
   autres. Bloqué sur `main` et `dev`, mais évitez-le partout.
2. **`git reset --hard` sans avoir compris** — supprime définitivement du travail non
   committé. Demandez avant.
3. **Committer un fichier `.env` ou une clé** — un secret poussé une fois reste dans
   l'historique même après suppression. En cas d'accident : prévenez immédiatement
   dans `#socle-technique` et révoquez le secret.
4. **Laisser une branche vivre plus d'une semaine** — elle diverge trop et la fusion
   devient douloureuse. Une carte trop grosse pour une semaine est une carte à découper.
5. **Rester une journée sans pousser** — c'est du travail que personne ne peut
   récupérer si votre machine lâche.

---

## 13. Antisèche

```bash
git status                     # où j'en suis
git switch dev && git pull     # partir de dev à jour
git switch -c feat/12-sujet    # créer ma branche
git add -p                     # choisir ce que je committe
git commit -m "type(domaine): action"
git push -u origin feat/12-sujet
git diff dev --stat            # ce que j'apporte, avant relecture
git stash / git stash pop      # mettre de côté un instant
git log --oneline --graph --all
```

Une commande dont vous n'êtes pas sûr se demande dans `#socle-technique` **avant**
de la taper. Une question coûte deux minutes ; un `reset --hard` mal placé coûte une
journée de travail.
