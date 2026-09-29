import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import { permissionsForRole } from './permissions';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  //Vérifie s'il existe au moins un user dans la base
  async hasAnyUser(): Promise<Boolean> {
    const count = await this.prisma.user.count();
    return count > 0;
  }
  
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
    //
    // Métier : ce compte est forcément le tout premier de l'application —
    // auth.controller refuse cette route dès qu'un utilisateur existe. Il doit
    // donc être ADMIN, et le rôle est imposé ici plutôt que laissé au DTO.
    //
    // Sans cela, le schéma appliquait @default(OUVRIER) : le premier compte ne
    // pouvait pas atteindre POST /users, réservé à ADMIN, et plus aucun compte
    // ne pouvait être créé. L'installation se bloquait elle-même, et il fallait
    // passer par la base pour s'en sortir.
    //
    // Le rôle n'est volontairement PAS exposé dans RegisterDTO : la route est
    // publique tant qu'aucun compte n'existe, un rôle choisi par l'appelant y
    // serait un choix offert à n'importe qui.
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: 'ADMIN',
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

  /**
   * Profil de l'utilisateur connecté, avec ses droits effectifs.
   *
   * Métier : sans cette route, le front n'a que ce qu'il a reçu au login. Un
   * changement de rôle n'y apparaît donc jamais — il continue d'afficher les
   * écrans de l'ancien rôle, même si l'API refuse désormais les appels
   * correspondants. C'est le pendant de la relecture en base faite dans
   * jwt.strategy : le serveur applique le bon rôle, encore faut-il que le
   * client puisse l'apprendre.
   *
   * On renvoie les permissions calculées plutôt que le seul rôle : laisser le
   * front dériver ses droits de son côté ferait exister la matrice en deux
   * exemplaires, qui divergeraient au premier ajustement.
   *
   * L'utilisateur est relu ici aussi : `userId` vient de request.user, lui-même
   * déjà relu à chaque requête, mais on a besoin du nom et du prénom que
   * validate() ne charge pas.
   */
  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        farmId: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Ce compte n\'existe plus');
    }

    return {
      ...user,
      permissions: permissionsForRole(user.role),
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
