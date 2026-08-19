import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';

@ApiTags('auth') // regroupe ces routes sous "auth" dans Swagger (/api/docs)
@Controller('auth')

export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')

    register(@Body() dto: RegisterDTO)
    {
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
