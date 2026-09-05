import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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

  async update(id: string, dto: UpdateUserDto, farmId: string) {
    await this.findOne(id, farmId); // vérifie l'existence ET l'appartenance à la ferme, réutilise le contrôle déjà écrit ci-dessus

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
