import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LinkClientDto } from '../employee/dto/link-client.dto';
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

  async remove(id: string, farmId: string, currentUserId: string) {
    const cible = await this.findOne(id, farmId);

    // Même raisonnement que dans update() : se supprimer soi-même, ou
    // supprimer le dernier Administrateur, laisse la ferme sans personne pour
    // gérer les comptes.
    if (id === currentUserId) {
      throw new BadRequestException('Vous ne pouvez pas supprimer votre propre compte');
    }

    if (cible.role === 'ADMIN') {
      const nombreAdmins = await this.prisma.user.count({
        where: { farmId, role: 'ADMIN' },
      });
      if (nombreAdmins <= 1) {
        throw new BadRequestException(
          'Impossible de supprimer le dernier Administrateur de la ferme : nommez-en un autre d\'abord',
        );
      }
    }

    // Un utilisateur est référencé par Production, StockMovement, Transaction,
    // Payment et StockTransfer, tous en onDelete par défaut, c'est-à-dire
    // RESTRICT. Supprimer un compte ayant saisi quoi que ce soit déclenchait
    // donc une violation de contrainte remontée en 500 : l'appelant voyait une
    // panne serveur là où il y a une règle métier parfaitement légitime — on
    // ne détruit pas l'auteur d'écritures comptables.
    //
    // On compte les références AVANT de supprimer, pour répondre 409 avec la
    // raison exacte. Ce n'est pas une correction de fond : elle exige
    // User.status pour désactiver au lieu de détruire (voir
    // ROLES_DEMANDE_DBA.md). En attendant, l'erreur devient au moins honnête.
    const [productions, mouvements, transactions, paiements, transfertsEnvoyes, transfertsRecus] =
      await Promise.all([
        this.prisma.production.count({ where: { userId: id } }),
        this.prisma.stockMovement.count({ where: { userId: id } }),
        this.prisma.transaction.count({ where: { userId: id } }),
        this.prisma.payment.count({ where: { userId: id } }),
        this.prisma.stockTransfer.count({ where: { senderId: id } }),
        this.prisma.stockTransfer.count({ where: { receiverId: id } }),
      ]);

    const references =
      productions + mouvements + transactions + paiements + transfertsEnvoyes + transfertsRecus;

    if (references > 0) {
      throw new ConflictException(
        `Ce compte est l'auteur de ${references} écriture(s) et ne peut pas être supprimé sans détruire leur traçabilité. ` +
          'La désactivation de compte n\'est pas encore disponible : elle attend le champ User.status côté base.',
      );
    }

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
