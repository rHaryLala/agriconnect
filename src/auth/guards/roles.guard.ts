import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate
{
    constructor(private reflector: Reflector) {}//Reflector pour lire les métadonnées

    canActivate(context: ExecutionContext): boolean {
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
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
      
      //Vérification si le rôle est autorisé
      return requiredRoles.includes(user.role);

    }
}