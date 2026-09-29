import { Body, Controller, ForbiddenException, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('auth') // regroupe ces routes sous "auth" dans Swagger (/api/docs)
@Controller('auth')

export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')

   async register(@Body() dto: RegisterDTO)
    {
        // Vérifie AVANT toute autre logique — si un compte existe déjà
    // quelque part dans la base, /auth/register n'a plus le droit
    // d'exister publiquement. Seul le tout premier compte (amorçage
    // initial de l'application) peut passer par cette route ; tous
    // les suivants doivent être créés par un Admin via POST /users.

    const dejaAmorce = await this.authService.hasAnyUser();
    if (dejaAmorce)
    {
        throw new ForbiddenException('Inscription fermé - contactez un Administrateur pour créer un compte');
    }
        // @Body() extrait et valide automatiquement le JSON reçu,
        // grâce au ValidationPipe global déjà configuré dans main.ts
        return this.authService.register(dto);
    }

    @Post('login')// POST /auth/login
    login(@Body() dto:LoginDTO)
    {
        return this.authService.login(dto);
    }

    /**
     * GET /auth/me — profil et droits de l'utilisateur connecté.
     *
     * Stack : seule route authentifiée de ce contrôleur, d'où le @UseGuards
     * posé ici et non sur la classe — register et login doivent rester
     * joignables sans jeton. Pas de @Roles : tout utilisateur authentifié a le
     * droit de savoir qui il est, et RolesGuard laisse de toute façon passer
     * les routes dépourvues du décorateur.
     *
     * Métier : c'est ce que le front doit appeler au démarrage, plutôt que de
     * se fier à la réponse de login gardée en mémoire. Un rôle modifié par un
     * Gérant devient ainsi visible dans l'interface, et pas seulement appliqué
     * en silence par l'API.
     */
    @Get('me')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    me(@CurrentUser() user: { id: string })
    {
        return this.authService.me(user.id);
    }

}
