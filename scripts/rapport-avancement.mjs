#!/usr/bin/env node
/**
 * Génère docs/avancement.html à partir de l'état réel du dépôt.
 *
 *   node scripts/rapport-avancement.mjs
 *
 * Aucune dépendance : tout vient de `git`. Les demandes de fusion sont lues
 * via `gh` quand il est disponible, et le rapport se génère sans lui sinon.
 *
 * Les chiffres ET les commentaires sont recalculés à chaque exécution : les
 * constats, les niveaux de gravité et les actions recommandées découlent de
 * seuils appliqués aux données, ils ne sont pas écrits en dur.
 */

import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';

// ---------------------------------------------------------------- paramètres

const EQUIPE = [
  {
    nom: 'Voahary Radoniaina',
    role: 'Backend · NestJS',
    branche: 'feature/backend',
    emails: ['voaharyradoniaina@gmail.com'],
  },
  {
    nom: 'Lesoa',
    role: 'Frontend · React',
    branche: 'feature/frontend',
    emails: ['lesoa.asa@zurcher.edu.mg'],
  },
  {
    nom: 'Simeon',
    role: 'Base de données · Prisma',
    branche: 'feature/database',
    emails: ['simeonsitrakiniaina@gmail.com', '274849571+MegaloDev@users.noreply.github.com'],
  },
];

const BASE = 'origin/dev';           // branche d'intégration de référence
const DEBUT_STAGE = '2026-08-11';    // premier commit du dépôt
const DUREE_SEMAINES = 5;
const SILENCE_ALERTE = 3;            // jours sans commit avant de le signaler
const AGE_BRANCHE_MAX = 7;           // jours, seuil fixé par CONTRIBUTING.md
const SORTIE = 'docs/avancement.html';

// ------------------------------------------------------------------- outils

const git = (...args) =>
  execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }).trim();

/** Exécute une commande git dont l'échec n'est pas fatal (branche absente…). */
const gitOpt = (...args) => {
  try {
    return git(...args);
  } catch {
    return null;
  }
};

const lignes = (sortie) => (sortie ? sortie.split('\n').filter(Boolean) : []);

const jours = (depuis, jusqua = new Date()) =>
  Math.floor((jusqua - new Date(depuis)) / 86400000);

const echappe = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const pluriel = (n, sing, plur = sing + 's') => `${n} ${n > 1 ? plur : sing}`;

// --------------------------------------------------------------- collecte

/** Tous les commits du dépôt, toutes branches confondues. */
function lireCommits() {
  const sep = '\u001f';
  return lignes(git('log', '--all', '--pretty=format:%H' + sep + '%ae' + sep + '%cI' + sep + '%s'))
    .map((l) => {
      const [sha, email, date, sujet] = l.split(sep);
      return { sha, email: email.toLowerCase(), date, sujet };
    });
}

/** Numéro de semaine ISO, pour regrouper l'activité. */
function semaineIso(iso) {
  const d = new Date(iso);
  const j = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  j.setUTCDate(j.getUTCDate() + 4 - (j.getUTCDay() || 7));
  const debut = new Date(Date.UTC(j.getUTCFullYear(), 0, 1));
  return Math.ceil(((j - debut) / 86400000 + 1) / 7);
}

/** État d'une branche de travail par rapport à la branche d'intégration. */
function lireBranche(nom) {
  const ref = `origin/${nom}`;
  if (!gitOpt('rev-parse', '--verify', '--quiet', ref)) return { nom, existe: false };

  const base = gitOpt('merge-base', BASE, ref);
  const comptes = gitOpt('rev-list', '--left-right', '--count', `${BASE}...${ref}`);
  const [retard, avance] = comptes ? comptes.split(/\s+/).map(Number) : [0, 0];
  const fichiers = lignes(gitOpt('ls-tree', '-r', '--name-only', ref) || '');

  return {
    nom,
    existe: true,
    orpheline: !base,
    avance,
    retard,
    fichiers: fichiers.length,
    fichiersCode: fichiers.filter((f) => /\.(ts|tsx|js|jsx|prisma|sql|css|vue)$/.test(f)).length,
    dernier: gitOpt('log', '-1', '--pretty=%cI', ref),
    // Répartition par module applicatif, pour décrire ce que contient la branche.
    modules: repartitionModules(fichiers),
  };
}

/** Compte les fichiers par module, quel que soit l'emplacement de `src`. */
function repartitionModules(fichiers) {
  const compte = new Map();
  for (const f of fichiers) {
    const m = f.match(/(?:^|\/)(?:src\/)?(?:features\/)?([^/]+)\//);
    if (!m) continue;
    if (/^(node_modules|dist|build|public|assets|\.github|scripts|docs|prisma)$/.test(m[1])) continue;
    compte.set(m[1], (compte.get(m[1]) || 0) + 1);
  }
  return [...compte.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
}

/** Détecte plusieurs schémas Prisma divergents entre les branches. */
function lireSchemas() {
  const trouves = [];
  for (const membre of EQUIPE) {
    const ref = `origin/${membre.branche}:prisma/schema.prisma`;
    const sha = gitOpt('rev-parse', ref);
    if (!sha) continue;
    const contenu = gitOpt('show', ref) || '';
    trouves.push({
      branche: membre.branche,
      sha,
      lignes: contenu.split('\n').length,
      modeles: [...contenu.matchAll(/^model\s+(\w+)/gm)].map((m) => m[1]),
    });
  }
  const distincts = new Set(trouves.map((t) => t.sha));
  return { trouves, divergent: distincts.size > 1 };
}

/** Demandes de fusion, si `gh` est installé et authentifié. */
function lirePullRequests() {
  const brut = (() => {
    for (const bin of ['gh', 'C:\\Program Files\\GitHub CLI\\gh.exe']) {
      try {
        return execFileSync(bin, ['pr', 'list', '--state', 'all', '--limit', '100',
          '--json', 'number,author,state,baseRefName,headRefName'], { encoding: 'utf8' });
      } catch { /* binaire absent ou non authentifié : on essaie le suivant */ }
    }
    return null;
  })();
  if (!brut) return null;
  try {
    return JSON.parse(brut);
  } catch {
    return null;
  }
}

// ------------------------------------------------------------- agrégation

const commits = lireCommits();
const maintenant = new Date();

const membres = EQUIPE.map((m) => {
  const adresses = m.emails.map((e) => e.toLowerCase());
  const siens = commits.filter((c) => adresses.includes(c.email));
  const semaines = new Map();
  for (const c of siens) {
    const s = semaineIso(c.date);
    semaines.set(s, (semaines.get(s) || 0) + 1);
  }
  const dernier = siens.length
    ? siens.map((c) => c.date).sort().at(-1)
    : null;
  const conformes = siens.filter((c) =>
    /^(feat|fix|refactor|docs|test|chore)\([a-z-]+\): /.test(c.sujet)).length;

  return {
    ...m,
    commits: siens.length,
    conformes,
    dernier,
    silence: dernier ? jours(dernier, maintenant) : null,
    semaines,
    branche: lireBranche(m.branche),
  };
});

const toutesSemaines = [...new Set(membres.flatMap((m) => [...m.semaines.keys()]))].sort((a, b) => a - b);
const totalCommits = membres.reduce((n, m) => n + m.commits, 0);
const totalConformes = membres.reduce((n, m) => n + m.conformes, 0);
const schemas = lireSchemas();
const prs = lirePullRequests();

const prsStagiaires = prs
  ? prs.filter((p) => EQUIPE.some((m) => p.headRefName === m.branche)).length
  : null;

// Fichiers applicatifs déjà présents sur la branche d'intégration.
const fichiersIntegres = lignes(gitOpt('ls-tree', '-r', '--name-only', BASE) || '')
  .filter((f) => /\.(ts|tsx|jsx|vue|prisma)$/.test(f) && !f.startsWith('scripts/')).length;

const jourStage = jours(DEBUT_STAGE, maintenant);
const semaineStage = Math.min(Math.ceil((jourStage + 1) / 7), DUREE_SEMAINES);

// ------------------------------------------------------- commentaires calculés

/** Titre et chapeau : ils changent selon l'état réel de l'intégration. */
function accroche() {
  if (fichiersIntegres === 0) {
    return {
      titre: `${pluriel(semaineStage, 'semaine')} de code, zéro ligne intégrée`,
      chapeau: `Les ${EQUIPE.length} stagiaires produisent à un rythme soutenu et le périmètre `
        + `fonctionnel avance. Mais rien de ce travail n’a atteint <span class="mono">dev</span> : `
        + `il vit sur ${pluriel(membres.filter((m) => m.branche.existe).length, 'branche isolée', 'branches isolées')}.`,
    };
  }
  const restant = membres.filter((m) => m.branche.existe && m.branche.avance > 0);
  if (restant.length === 0) {
    return {
      titre: 'Tout le travail est intégré',
      chapeau: `Les ${EQUIPE.length} branches de travail sont à jour avec `
        + `<span class="mono">dev</span> : ${fichiersIntegres} fichiers applicatifs y sont assemblés.`,
    };
  }
  return {
    titre: `Intégration entamée, ${pluriel(restant.length, 'branche encore à part', 'branches encore à part')}`,
    chapeau: `<span class="mono">dev</span> porte désormais ${fichiersIntegres} fichiers applicatifs. `
      + `Il reste ${restant.map((m) => `<span class="mono">${m.branche.nom}</span>`).join(', ')} `
      + `à fusionner, soit ${pluriel(restant.reduce((n, m) => n + m.branche.avance, 0), 'commit')} en attente.`,
  };
}

/** Une phrase de verdict par stagiaire, dérivée de l'activité et du volume. */
function verdict(m) {
  const bouts = [];
  if (!m.branche.existe) return 'Aucune branche de travail sur le dépôt distant.';

  if (m.branche.modules.length) {
    bouts.push(`Modules principaux : ${m.branche.modules
      .map(([nom, n]) => `<code>${echappe(nom)}</code> (${n})`).join(', ')}.`);
  }
  bouts.push(`${pluriel(m.branche.fichiersCode, 'fichier de code')} sur la branche.`);

  if (m.silence === null) bouts.push('Aucun commit enregistré.');
  else if (m.silence >= SILENCE_ALERTE) bouts.push(`<strong>Silencieux depuis ${pluriel(m.silence, 'jour')}.</strong>`);
  else if (m.silence === 0) bouts.push('Actif aujourd’hui.');
  else bouts.push(`Dernier commit il y a ${pluriel(m.silence, 'jour')}.`);

  if (m.branche.avance > 0 && m.branche.orpheline) {
    bouts.push('Branche <strong>sans ancêtre commun</strong> avec l’intégration.');
  }
  return bouts.join(' ');
}

/** Risques : chacun n'apparaît que si la donnée le justifie. */
function risques() {
  const r = [];

  if (fichiersIntegres === 0) {
    r.push(['critique', 'Aucune intégration à ce jour',
      `Front, back et base n’ont jamais été assemblés. Le coût de la première intégration `
      + `croît chaque jour, à ${pluriel(DUREE_SEMAINES - semaineStage, 'semaine')} de la fin.`]);
  }

  for (const m of membres.filter((x) => x.branche.existe && x.branche.orpheline && x.branche.avance > 0)) {
    r.push(['critique', `<span class="mono">${m.branche.nom}</span> sans ancêtre commun`,
      'GitHub refusera la demande de fusion (<span class="mono">no history in common</span>). '
      + 'Une fusion manuelle en <span class="mono">--allow-unrelated-histories</span> est nécessaire.']);
  }

  if (schemas.divergent) {
    const detail = schemas.trouves
      .map((s) => `<span class="mono">${s.branche}</span> : ${s.modeles.length} modèles sur ${s.lignes} lignes`)
      .join(' — ');
    r.push(['eleve', 'Schémas Prisma concurrents',
      `${detail}. Plusieurs personnes font autorité sur la même vérité : la fusion produira un conflit lourd.`]);
  }

  const vieilles = membres.filter((m) => {
    if (!m.branche.existe || m.branche.avance === 0) return false;
    // On veut le plus ancien commit non intégré : `git log` est antichronologique,
    // le premier commit de la branche est donc la dernière ligne.
    const horsBase = lignes(gitOpt('log', '--pretty=%cI', `${BASE}..origin/${m.branche.nom}`) || '');
    const premier = horsBase.at(-1);
    return premier && jours(premier, maintenant) > AGE_BRANCHE_MAX;
  });
  if (vieilles.length) {
    r.push(['eleve', `${pluriel(vieilles.length, 'branche dépasse', 'branches dépassent')} la semaine`,
      `<span class="mono">CONTRIBUTING.md</span> fixe une semaine maximum : `
      + `${vieilles.map((m) => `<span class="mono">${m.branche.nom}</span>`).join(', ')}.`]);
  }

  if (prsStagiaires === 0) {
    r.push(['eleve', 'Aucune relecture croisée',
      'Aucun stagiaire n’a ouvert de demande de fusion. Personne n’a jamais lu le code d’un autre : '
      + 'les écarts de style et les doublons ne seront découverts qu’à l’intégration.']);
  }

  const taux = totalCommits ? Math.round((totalConformes / totalCommits) * 100) : 100;
  if (taux < 70) {
    r.push(['moyen', 'Conventions de commit peu suivies',
      `${totalConformes} messages sur ${totalCommits} respectent le format `
      + `<span class="mono">type(domaine)&#58;</span>, soit ${taux} %.`]);
  }

  if (!r.length) {
    r.push(['faible', 'Aucun risque majeur détecté',
      'Les branches sont à jour, l’intégration suit et les conventions sont respectées.']);
  }
  return r;
}

/** Actions : déduites des risques, dans l'ordre où elles débloquent le reste. */
function actions() {
  const a = [];
  for (const m of membres.filter((x) => x.branche.existe && x.branche.orpheline && x.branche.avance > 0)) {
    a.push([`Rattacher <span class="mono">${m.branche.nom}</span> à l’histoire commune`,
      'Branche intermédiaire issue de <span class="mono">dev</span>, fusion en histoires non liées, puis demande de fusion normale.']);
  }
  if (schemas.divergent) {
    a.push(['Trancher le schéma Prisma',
      'Désigner la branche qui fait autorité, fusionner les versions en une seule source, puis interdire aux autres de la modifier.']);
  }
  if (fichiersIntegres === 0) {
    a.push(['Geler les nouvelles fonctionnalités le temps d’intégrer',
      'Chaque jour de développement supplémentaire sur branche isolée alourdit la fusion à venir.']);
  }
  if (prsStagiaires === 0) {
    a.push([`Faire ouvrir ${pluriel(membres.filter((m) => m.branche.existe).length, 'demande de fusion')} vers <span class="mono">dev</span>`,
      'Une par stagiaire, relue par un autre. Prévoir du temps pour accompagner cette première relecture.']);
  }
  const taux = totalCommits ? (totalConformes / totalCommits) : 1;
  if (taux < 0.7) {
    a.push(['Reprendre les conventions de commit en séance',
      'Le format <span class="mono">type(domaine)&#58; action</span> est dans <span class="mono">CONTRIBUTING.md</span> ; un rappel de dix minutes suffit généralement.']);
  }
  if (!a.length) {
    a.push(['Poursuivre au même rythme',
      'Aucun blocage détecté : maintenir des branches courtes et une relecture par demande de fusion.']);
  }
  return a;
}

// ----------------------------------------------------------------- rendu

const LIBELLE_GRAVITE = { critique: 'Critique', eleve: 'Élevé', moyen: 'Moyen', faible: 'Faible' };
const CLASSE_GRAVITE = { critique: 'p-crit', eleve: 'p-warn', moyen: 'p-warn', faible: 'p-ok' };

const dateFr = (iso, avecHeure = false) =>
  new Date(iso).toLocaleDateString('fr-FR',
    avecHeure ? { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }
      : { day: 'numeric', month: 'long', year: 'numeric' });

const { titre, chapeau } = accroche();

const html = `<title>Avancement AgriConnect</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=IBM+Plex+Mono:wght@400;500&display=swap">

<style>
  :root {
    --paper:#F7F8F4; --surface:#FFFFFF; --surface-2:#EEF0E8;
    --ink:#1A1E17; --ink-2:#4A5044; --ink-3:#767C6E; --rule:#D8DCD0;
    --accent:#3E6B4F; --accent-ink:#2C4E39;
    --ok:#3E7D5A; --warn:#9A6420; --crit:#A33B3E;
    --ok-bg:#E4EFE7; --warn-bg:#F6EBD9; --crit-bg:#F7E3E3;
  }
  :root:not([data-theme="light"]) { color-scheme: light; }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --paper:#13160F; --surface:#1B1F17; --surface-2:#232819;
      --ink:#E9EBE1; --ink-2:#B2B8A6; --ink-3:#838A77; --rule:#2F3527;
      --accent:#8FBF9E; --accent-ink:#A9D2B6;
      --ok:#7FBE99; --warn:#D6A45E; --crit:#DE868A;
      --ok-bg:#1E2E23; --warn-bg:#322815; --crit-bg:#331E1F;
      color-scheme: dark;
    }
  }
  :root[data-theme="dark"] {
    --paper:#13160F; --surface:#1B1F17; --surface-2:#232819;
    --ink:#E9EBE1; --ink-2:#B2B8A6; --ink-3:#838A77; --rule:#2F3527;
    --accent:#8FBF9E; --accent-ink:#A9D2B6;
    --ok:#7FBE99; --warn:#D6A45E; --crit:#DE868A;
    --ok-bg:#1E2E23; --warn-bg:#322815; --crit-bg:#331E1F;
    color-scheme: dark;
  }

  body { background: var(--paper); color: var(--ink);
    font-family: "Source Serif 4", Georgia, serif; font-size: 17px; line-height: 1.62;
    -webkit-font-smoothing: antialiased; }
  .wrap { max-width: 1000px; margin: 0 auto; padding: 56px 28px 96px;
    display: flex; flex-direction: column; gap: 52px; }
  h1, h2, h3 { font-family: "Familjen Grotesk", "Helvetica Neue", Arial, sans-serif; }
  .eyebrow { font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: 12px;
    letter-spacing: .13em; text-transform: uppercase; color: var(--ink-3); }
  h1 { font-size: clamp(34px, 5.2vw, 52px); line-height: 1.06; font-weight: 700;
    letter-spacing: -.022em; text-wrap: balance; margin: 14px 0 0; }
  .standfirst { max-width: 64ch; font-size: 20px; line-height: 1.55; color: var(--ink-2); margin: 20px 0 0; }
  h2 { font-size: 25px; font-weight: 600; letter-spacing: -.014em; text-wrap: balance;
    margin: 0; padding-bottom: 12px; border-bottom: 2px solid var(--ink); }
  h3 { font-size: 18px; font-weight: 600; margin: 0; letter-spacing: -.008em; }
  section { display: flex; flex-direction: column; gap: 22px; }
  p { margin: 0; max-width: 68ch; }
  .lead-note { border-left: 3px solid var(--accent); padding: 4px 0 4px 18px; color: var(--ink-2); }

  .scroll { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-family: "Familjen Grotesk", Arial, sans-serif;
    font-size: 15px; min-width: 540px; }
  caption { text-align: left; font-family: "IBM Plex Mono", monospace; font-size: 12px;
    letter-spacing: .1em; text-transform: uppercase; color: var(--ink-3); padding-bottom: 10px; }
  th { text-align: left; font-weight: 600; font-size: 12.5px; letter-spacing: .07em;
    text-transform: uppercase; color: var(--ink-3); border-bottom: 1px solid var(--rule);
    padding: 0 14px 9px 0; }
  td { padding: 11px 14px 11px 0; border-bottom: 1px solid var(--rule);
    vertical-align: top; color: var(--ink-2); }
  td:first-child { color: var(--ink); font-weight: 500; }
  .num { font-family: "IBM Plex Mono", monospace; font-variant-numeric: tabular-nums; white-space: nowrap; }
  tr:last-child td { border-bottom: none; }

  .figures { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 1px; background: var(--rule); border: 1px solid var(--rule); }
  .fig { background: var(--surface); padding: 20px 20px 18px; display: flex; flex-direction: column; gap: 5px; }
  .fig b { font-family: "Familjen Grotesk", Arial, sans-serif; font-size: 34px; font-weight: 700;
    line-height: 1; letter-spacing: -.03em; font-variant-numeric: tabular-nums; color: var(--ink); }
  .fig b.alarm { color: var(--crit); }
  .fig span { font-family: "Familjen Grotesk", Arial, sans-serif; font-size: 13.5px;
    color: var(--ink-3); line-height: 1.35; }

  .people { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; }
  .person { background: var(--surface); border: 1px solid var(--rule); padding: 22px;
    display: flex; flex-direction: column; gap: 14px; }
  .person header { display: flex; flex-direction: column; gap: 3px; }
  .person .role { font-family: "IBM Plex Mono", monospace; font-size: 11.5px;
    letter-spacing: .1em; text-transform: uppercase; color: var(--accent-ink); }
  .person dl { margin: 0; display: grid; grid-template-columns: auto 1fr; gap: 7px 14px;
    font-family: "Familjen Grotesk", Arial, sans-serif; font-size: 14px; }
  .person dt { color: var(--ink-3); }
  .person dd { margin: 0; color: var(--ink); font-variant-numeric: tabular-nums; text-align: right; }
  .person p { font-size: 15px; color: var(--ink-2); line-height: 1.5; }

  code, .mono { font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: .88em;
    background: var(--surface-2); padding: 1px 5px; border-radius: 2px; color: var(--ink); }
  .pill { display: inline-block; font-family: "Familjen Grotesk", Arial, sans-serif;
    font-size: 11.5px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase;
    padding: 3px 9px; border-radius: 2px; white-space: nowrap; }
  .p-crit { background: var(--crit-bg); color: var(--crit); }
  .p-warn { background: var(--warn-bg); color: var(--warn); }
  .p-ok { background: var(--ok-bg); color: var(--ok); }

  ol.actions { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column;
    gap: 16px; counter-reset: a; }
  ol.actions li { display: grid; grid-template-columns: 34px 1fr; gap: 14px; align-items: start;
    padding-bottom: 16px; border-bottom: 1px solid var(--rule); }
  ol.actions li:last-child { border-bottom: none; padding-bottom: 0; }
  ol.actions li::before { counter-increment: a; content: counter(a);
    font-family: "IBM Plex Mono", monospace; font-size: 13px; color: var(--accent-ink);
    border: 1px solid var(--rule); height: 30px; display: grid; place-items: center; }
  ol.actions strong { font-family: "Familjen Grotesk", Arial, sans-serif; font-size: 16.5px;
    display: block; margin-bottom: 3px; }
  ol.actions span { font-size: 15.5px; color: var(--ink-2); }

  footer { border-top: 1px solid var(--rule); padding-top: 20px;
    font-family: "Familjen Grotesk", Arial, sans-serif; font-size: 13.5px;
    color: var(--ink-3); max-width: 72ch; }
</style>

<div class="wrap">

  <header>
    <div class="eyebrow">Rapport de supervision · ${dateFr(maintenant)} · semaine ${semaineStage} sur ${DUREE_SEMAINES}</div>
    <h1>${titre}</h1>
    <p class="standfirst">${chapeau}</p>
  </header>

  <section>
    <div class="figures">
      <div class="fig"><b>${totalCommits}</b><span>commits des stagiaires depuis le ${dateFr(DEBUT_STAGE)}</span></div>
      <div class="fig"><b${prsStagiaires === 0 ? ' class="alarm"' : ''}>${prsStagiaires ?? '—'}</b><span>demandes de fusion ouvertes par les stagiaires</span></div>
      <div class="fig"><b>${membres.filter((m) => m.branche.existe).length}</b><span>branches de travail actives</span></div>
      <div class="fig"><b${fichiersIntegres === 0 ? ' class="alarm"' : ''}>${fichiersIntegres}</b><span>fichiers applicatifs sur <span class="mono">dev</span></span></div>
    </div>
    ${fichiersIntegres === 0
      ? `<p class="lead-note">L’intégration n’a jamais été tentée. ${pluriel(semaineStage, 'semaine')} de travail parallèle n’ont pas encore été confrontées entre elles, à mi-parcours d’un stage de ${DUREE_SEMAINES} semaines.</p>`
      : `<p class="lead-note">L’intégration est engagée : <span class="mono">dev</span> porte ${pluriel(fichiersIntegres, 'fichier applicatif')}.</p>`}
  </section>

  <section>
    <h2>Où en est chacun</h2>
    <div class="people">
${membres.map((m) => `      <article class="person">
        <header>
          <div class="role">${echappe(m.role)}</div>
          <h3>${echappe(m.nom)}</h3>
        </header>
        <dl>
          <dt>Commits</dt><dd>${m.commits}</dd>
          <dt>Branche</dt><dd class="mono">${echappe(m.branche.nom)}</dd>
          <dt>Fichiers de code</dt><dd>${m.branche.fichiersCode ?? '—'}</dd>
          <dt>Dernier commit</dt><dd>${m.dernier ? dateFr(m.dernier, true) : '—'}</dd>
        </dl>
        <p>${verdict(m)}</p>
      </article>`).join('\n')}
    </div>
  </section>

  <section>
    <h2>Rythme de travail</h2>
    <div class="scroll">
      <table>
        <caption>Commits par semaine calendaire</caption>
        <thead>
          <tr><th>Stagiaire</th>${toutesSemaines.map((s) => `<th class="num">S${s}</th>`).join('')}<th class="num">Total</th></tr>
        </thead>
        <tbody>
${membres.map((m) => `          <tr><td>${echappe(m.nom.split(' ')[0])}</td>${toutesSemaines
    .map((s) => `<td class="num">${m.semaines.get(s) || 0}</td>`).join('')}<td class="num">${m.commits}</td></tr>`).join('\n')}
        </tbody>
      </table>
    </div>
  </section>

  <section>
    <h2>Risques identifiés</h2>
    <div class="scroll">
      <table>
        <thead><tr><th>Gravité</th><th>Constat</th><th>Conséquence</th></tr></thead>
        <tbody>
${risques().map(([g, constat, consequence]) => `          <tr>
            <td><span class="pill ${CLASSE_GRAVITE[g]}">${LIBELLE_GRAVITE[g]}</span></td>
            <td>${constat}</td>
            <td>${consequence}</td>
          </tr>`).join('\n')}
        </tbody>
      </table>
    </div>
  </section>

  <section>
    <h2>À faire cette semaine</h2>
    <ol class="actions">
${actions().map(([t, d]) => `      <li><div><strong>${t}</strong><span>${d}</span></div></li>`).join('\n')}
    </ol>
  </section>

  <footer>
    Généré automatiquement par <span class="mono">scripts/rapport-avancement.mjs</span>
    le ${dateFr(maintenant, true)}, à partir de l’historique de toutes les branches du dépôt.
    ${prs === null ? 'Les demandes de fusion n’ont pas pu être lues : <span class="mono">gh</span> est absent ou non authentifié.' : ''}
    Le décompte par personne repose sur les adresses de courriel des auteurs, déclarées en tête du script.
  </footer>

</div>
`;

mkdirSync('docs', { recursive: true });
writeFileSync(SORTIE, html, 'utf8');

console.log(`${SORTIE} régénéré — ${totalCommits} commits, `
  + `${membres.filter((m) => m.branche.existe).length} branches, `
  + `${risques().length} risque(s) signalé(s).`);
