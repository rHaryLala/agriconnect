import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { Role } from "@prisma/client";

/**
 * Stack : garde NestJS. Il s'exécute après JwtAuthGuard, qui a déjà posé
 * request.user via JwtStrategy.validate() — donc avec un rôle relu en base, et
 * non celui figé dans le jeton à l'instant du login.
 *
 * Le Reflector lit les métadonnées déposées par @Roles(...), sur la méthode
 * comme sur la classe. getAllAndOverride fait primer la méthode : un @Roles
 * posé sur une route l'emporte sur celui du contrôleur, ce qui permet
 * d'élargir ou de restreindre une route isolée sans dupliquer le décorateur
 * partout ailleurs.
 */
@Injectable()
export class RolesGuard implements CanActivate
{
    constructor(private reflector: Reflector) {}//Reflector pour lire les métadonnées

    canActivate(context: ExecutionContext): boolean {
      const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      // Si la route n'a AUCUN décorateur @Roles(), on laisse passer
      if (!requiredRoles)
      {
        return true;
      }

      //Qui a fait la requête ?
      const { user } = context.switchToHttp().getRequest();

      // Filet de sécurité : une route qui exige un rôle, mais dont le
      // contrôleur a oublié JwtAuthGuard, arriverait ici sans utilisateur.
      // L'ancienne version lisait alors une propriété sur undefined, donc une
      // 500 — une erreur de configuration se présentait comme une panne
      // serveur. On répond ce qui est vrai : la requête n'est pas authentifiée.
      if (!user)
      {
        throw new UnauthorizedException('Authentification requise pour cette route');
      }

      // Refus explicite plutôt qu'un simple `return false`.
      //
      // Métier : un `false` produit un 403 au corps inutilisable. Le front ne
      // distingue alors pas « ton rôle ne suffit pas » d'une panne, et le
      // support ne peut pas expliquer à un utilisateur pourquoi il est bloqué.
      // Le message nomme le rôle porté et ceux attendus : ce sont des
      // informations que l'appelant possède déjà sur lui-même, il n'y a rien
      // à divulguer.
      if (!requiredRoles.includes(user.role))
      {
        throw new ForbiddenException(
          `Accès refusé : rôle « ${user.role} », or cette action demande ${requiredRoles.join(' ou ')}`,
        );
      }

      return true;
    }
}