//Definition de la clé à rechercher

import { SetMetadata } from "@nestjs/common";

// Une clé unique pour retrouver cette métadonnée plus tard dans le guard 
// une simple chaîne de caractères, choisie une fois pour toutes.
export const ROLES_KEY = 'roles';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
