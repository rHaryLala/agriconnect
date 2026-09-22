import { Body, Controller, ForbiddenException, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';

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

}
