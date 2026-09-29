import { Role } from '@prisma/client';

/**
 * Stack : module TypeScript pur, sans décorateur NestJS ni accès Prisma. Ce
 * n'est ni un service ni un provider : une table de constantes et deux
 * fonctions, importables partout sans injection.
 *
 * Métier : matrice rôle -> droits, miroir de `ROLE_PRESETS` du front
 * (`src/lib/permissions.ts`). Le front s'en sert pour masquer ou griser ses
 * écrans ; le serveur en a besoin pour la même raison inverse — une interface
 * masquée n'est pas une interface protégée, l'API reste appelable directement.
 *
 * Le but de ce fichier est d'avoir UNE définition consultable des droits,
 * plutôt que des listes de rôles recopiées à la main dans chaque @Roles(...).
 * Les décorateurs existants ne sont pas réécrits ici : ils restent la source
 * d'autorisation effective, et cette matrice les documente et alimente
 * /auth/me. Les faire converger demanderait de toucher tous les contrôleurs,
 * ce qui sort du périmètre « gestion des rôles ».
 */

/** Modules fonctionnels, repris à l'identique de ModuleKey côté front. */
export const MODULE_KEYS = [
  'dashboard',
  'production',
  'stock',
  'finance',
  'clients',
  'fournisseurs',
  'personnel',
  'settings',
] as const;

export type ModuleKey = (typeof MODULE_KEYS)[number];

export const PERMISSION_ACTIONS = ['read', 'create', 'update', 'delete'] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

/** Forme « module:action », identique au type Permission du front. */
export type Permission = `${ModuleKey}:${PermissionAction}`;

function permission(module: ModuleKey, action: PermissionAction): Permission {
  return `${module}:${action}`;
}

function fullAccess(module: ModuleKey): Permission[] {
  return PERMISSION_ACTIONS.map((action) => permission(module, action));
}

function readOnly(module: ModuleKey): Permission[] {
  return [permission(module, 'read')];
}

/**
 * Les cinq rôles de l'enum Role du schéma, sans exception.
 *
 * `Record<Role, …>` n'est pas cosmétique : si le DBA ajoute une valeur à l'enum
 * Prisma, ce fichier cesse de compiler tant que le rôle n'a pas reçu ses
 * droits. C'est voulu — un rôle sans entrée ici serait silencieusement traité
 * comme dépourvu de tout accès, ce qui est le genre de régression qu'on ne
 * découvre qu'en production.
 *
 * Correspondance avec les rôles métier du cahier des charges :
 *   ADMIN              -> Gérant, accès complet
 *   COMPTABLE          -> tient la caisse et les tiers ; lecture seule sur le
 *                         terrain, puisqu'il ne saisit ni production ni stock
 *   OUVRIER            -> saisie de terrain uniquement
 *   MAGASINIER         -> l'ouvrier, plus les clients : il sert le circuit
 *                         Ferme -> Magasinier -> Store
 *   CONTROLEUR_INTERNE -> lecture partout, écriture nulle part : c'est la
 *                         définition même du contrôle, il vérifie le travail
 *                         des autres sans pouvoir le modifier
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: MODULE_KEYS.flatMap(fullAccess),

  COMPTABLE: [
    ...fullAccess('dashboard'),
    ...readOnly('production'),
    ...readOnly('stock'),
    ...fullAccess('finance'),
    ...fullAccess('clients'),
    ...fullAccess('fournisseurs'),
    ...fullAccess('personnel'),
  ],

  OUVRIER: [...fullAccess('dashboard'), ...fullAccess('production'), ...fullAccess('stock')],

  MAGASINIER: [
    ...fullAccess('dashboard'),
    ...fullAccess('production'),
    ...fullAccess('stock'),
    ...fullAccess('clients'),
  ],

  CONTROLEUR_INTERNE: MODULE_KEYS.flatMap(readOnly),
};

/**
 * Droits effectifs d'un rôle.
 *
 * TODO (bloqué, en attente du DBA) — le front prévoit déjà un override par
 * compte (`effectivePermissions(role, override)`), objectif étendu de la
 * Semaine 4. Il demande une table de permissions par utilisateur, absente du
 * schéma final. Cette fonction ne prend donc qu'un rôle : ajouter un second
 * paramètre qui n'aurait aucune source de données serait une fausse promesse.
 */
export function permissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role];
}

/** Ce rôle a-t-il ce droit précis ? */
export function roleHasPermission(
  role: Role,
  module: ModuleKey,
  action: PermissionAction,
): boolean {
  return ROLE_PERMISSIONS[role].includes(permission(module, action));
}
