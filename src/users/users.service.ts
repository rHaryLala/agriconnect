import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // farmId vient toujours de l'admin connecté, jamais du corps de la requête 
  async create(dto: CreateUserDto, farmId: string) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Un compte existe déjà avec cet email');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role, // undefined si non fourni → le schéma applique @default(OUVRIER)
        farmId,
      },
    });

    return this.excludePassword(user);
  }

  async findAll(farmId: string) {
    const users = await this.prisma.user.findMany({ where: { farmId } });
    return users.map((u) => this.excludePassword(u));
  }

  async findOne(id: string, farmId: string) {
    const user = await this.prisma.user.findFirst({ where: { id, farmId } });
    // "findFirst" avec farmId (pas "findUnique" avec juste id) : ça empêche
    // un Admin de récupérer un utilisateur d'une AUTRE ferme même en
    // devinant son id — la requête ne le trouve simplement pas.
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }
    return this.excludePassword(user);
  }

  async update(id: string, dto: UpdateUserDto, farmId: string, currentUserId: string) {
    const cible = await this.findOne(id, farmId); // vérifie l'existence ET l'appartenance à la ferme, réutilise le contrôle déjà écrit ci-dessus

    // Le changement de rôle est la seule modification qui puisse mettre la
    // ferme en difficulté : les deux contrôles ci-dessous ne s'appliquent donc
    // qu'à lui, et seulement quand il retire réellement le rôle ADMIN.
    const retraitDuRoleAdmin =
      dto.role !== undefined && cible.role === 'ADMIN' && dto.role !== 'ADMIN';

    if (retraitDuRoleAdmin) {
      // Un Gérant qui se rétrograde perd immédiatement l'accès à ce module,
      // et ne peut donc plus revenir en arrière — la relecture du rôle en base
      // à chaque requête (jwt.strategy) rend l'effet instantané, sans même
      // attendre une reconnexion. Confier ce changement à un autre Gérant
      // évite la manœuvre irréversible faite par inadvertance.
      if (id === currentUserId) {
        throw new BadRequestException(
          'Vous ne pouvez pas retirer votre propre rôle Administrateur — demandez à un autre Administrateur de le faire',
        );
      }

      // Rétrograder le dernier Administrateur laisserait la ferme sans
      // personne pour gérer les comptes : plus aucune création, modification
      // ni attribution de rôle ne serait possible, et il faudrait intervenir
      // directement en base pour s'en sortir. C'est la même impasse que celle
      // corrigée à l'amorçage dans auth.service.
      const nombreAdmins = await this.prisma.user.count({
        where: { farmId, role: 'ADMIN' },
      });
      if (nombreAdmins <= 1) {
        throw new BadRequestException(
          'Impossible de rétrograder le dernier Administrateur de la ferme : nommez-en un autre d\'abord',
        );
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: dto, // seuls les champs présents dans dto sont modifiés, grâce à @IsOptional()
    });

    return this.excludePassword(user);
  }

  async remove(id: string, farmId: string) {
    await this.findOne(id, farmId);
    await this.prisma.user.delete({ where: { id } });
    return { message: 'Utilisateur supprimé' };
  }

  // Petite fonction utilitaire : évite de dupliquer 5 fois la même
  // déstructuration dans chaque méthode ci-dessus.
  private excludePassword(user: { password: string; [key: string]: unknown }) {
    const { password, ...rest } = user;
    return rest;
  }
}
