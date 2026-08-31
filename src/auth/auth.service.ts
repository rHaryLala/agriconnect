import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Méthode privée : récupère l'unique ferme existante, 
  // ou la crée si c'est la toute première inscription de l'application.

  private async resolveFarmId(): Promise<string> {
    const farm = await this.prisma.farm.findFirst();
    if (farm) {
      return farm.id;
    }
    const newFarm = await this.prisma.farm.create({
      data: { name: 'Agriconnect_Farm' },
    });
    return newFarm.id;
  }

  async register(dto: RegisterDTO) {
    // vérifier qu'aucun compte n'existe déjà avec cet email
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Un compte existe déjà avec cet email');
    }

    // trouver (ou créer) la ferme à laquelle rattacher ce compte
    const farmId = await this.resolveFarmId();

    // Hashage mot de passe
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Étape 4 : créer l'utilisateur en base
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        farmId,
      },
    });

    //return sans password pour sécurité
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }

  async login(dto: LoginDTO) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });


    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // bcrypt.compare re-hache le mot de passe fourni et compare le résultat au hash stocké 
    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // Le "payload" est le contenu du jeton — ce qu'on veut pouvoir relire
    // sans repasser par la base à chaque requête protégée.
    // "sub" (subject) est une convention du standard JWT
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      farmId: user.farmId, // déjà inclus même à une seule ferme, prêt pour le multi-ferme futur
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}