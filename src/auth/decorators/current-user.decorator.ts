import { createParamDecorator, ExecutionContext } from "@nestjs/common";

// Évite de réécrire "context.switchToHttp().getRequest().user" dans
// chaque contrôleur.

export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    }
)