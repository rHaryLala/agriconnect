import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductionDto } from './dto/create-production.dto';
import { UpdateProductionDto } from './dto/update-production.dto';

// Constante nommée plutôt qu'un "7" écrit en dur dans le code plus bas :
// si RG-07 change un jour (ex: 10 jours au lieu de 7), il n'y a qu'UN
// seul endroit à modifier, et le nom explique déjà à quoi sert ce chiffre.
const RETROACTIVE_WINDOW_DAYS = 7; // RG-07

@Injectable()
export class ProductionService {
  // Injection de PrismaService — jamais instancié nous-mêmes avec "new"
  constructor(private prisma: PrismaService) {}

  // Méthode privée : "private" veut dire qu'elle n'est utilisable que
  // DANS ce service, jamais appelée directement depuis le contrôleur.
  // Elle retourne soit une Date valide, soit lève une exception —
  // jamais les deux en même temps, ce qui simplifie son utilisation.
  private validateDate(dateInput: string | undefined, role: string): Date {
    if (!dateInput) {
      // Aucune date envoyée par le front = on suppose "aujourd'hui".
      return new Date();
    }

    // Convertit le texte reçu (ex: "2026-08-20") en vrai objet Date exploitable
    const requestedDate = new Date(dateInput);

    // Calcule combien de jours séparent la date demandée d'aujourd'hui.
    // Date.now() - requestedDate donne une différence en millisecondes ;
    // on divise par (1000ms * 60s * 60min * 24h) pour obtenir des jours entiers.
    const diffDays = Math.floor(
      (Date.now() - requestedDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays <= 0) {
      // Différence négative ou nulle = la date demandée est aujourd'hui
      // ou dans le futur → ce n'est PAS une saisie rétroactive, donc
      // aucune restriction de rôle à appliquer, on l'accepte directement.
      return requestedDate;
    }

    // À partir d'ici, on sait que la date est dans le passé.
    // RG-07 : seuls Gérant et Comptable ont le droit de saisir a posteriori —
    // un Employé de terrain ne peut saisir que le jour même.
    if (role !== 'ADMIN' && role !== 'COMPTABLE') {
      throw new ForbiddenException(
        'Seuls le Gérant et le Comptable peuvent saisir une production a posteriori',
      );
    }

    // Même un rôle autorisé ne peut pas remonter indéfiniment dans le temps —
    // au-delà de la fenêtre définie par RG-07, il faut une correction manuelle
    // validée par le Gérant, pas une simple saisie normale.
    if (diffDays > RETROACTIVE_WINDOW_DAYS) {
      throw new BadRequestException(
        `Impossible de saisir une date de plus de ${RETROACTIVE_WINDOW_DAYS} jours en arrière — contacte le Gérant`,
      );
    }

    // Toutes les vérifications sont passées : la date est acceptée telle quelle
    return requestedDate;
  }

  async create(dto: CreateProductionDto, userId: string, role: string, farmId: string) {
    // Première étape : valider la date AVANT de toucher à la base —
    // inutile de commencer une transaction si la date est de toute façon invalide
    const date = this.validateDate(dto.date, role);

    // stockItemId est optionnel (voir le DTO) : une production peut exister
    // sans article de stock correspondant. Mais SI un id est fourni, on doit
    // vérifier qu'il existe réellement et qu'il appartient bien à la ferme
    // de l'utilisateur — sinon n'importe qui pourrait pointer vers l'article
    // d'une autre ferme en devinant un UUID.
    if (dto.stockItemId) {
      const item = await this.prisma.stockItem.findFirst({
        where: { id: dto.stockItemId, farmId },
      });
      if (!item) {
        throw new NotFoundException('Article de stock introuvable');
      }
    }

    // RG-05 (atomicité) + RG-12 (Production → entrée en stock automatique) :
    // la production ET le mouvement de stock qui en découle doivent
    // réussir ensemble, ou pas du tout — d'où la transaction Prisma.
    // Tout ce qui suit utilise "tx" (et non "this.prisma") pour que chaque
    // opération fasse partie de cette même transaction.
    return this.prisma.$transaction(async (tx) => {
      // Étape 1 : enregistrer la production elle-même
      const production = await tx.production.create({
        data: {
          type: dto.type,
          quantity: dto.quantity,
          unit: dto.unit,
          notes: dto.notes,
          date,       // la date validée plus haut, pas dto.date brut
          userId,     // RG-04 : traçabilité — qui a saisi cette production
          farmId,
          stockItemId: dto.stockItemId,
        },
      });

      // Étape 2, seulement si un article de stock est lié : répercuter
      // automatiquement cette production en entrée de stock (RG-12).
      if (dto.stockItemId) {
        // On crée d'abord la trace du mouvement (pour l'historique et l'audit)...
        await tx.stockMovement.create({
          data: {
            itemId: dto.stockItemId,
            type: 'IN',
            quantity: dto.quantity,
            reason: `Production du ${date.toLocaleDateString()}`,
            userId,
          },
        });

        // ...puis on met à jour la quantité réelle en stock.
        // "increment" plutôt que recalculer une valeur à la main : évite
        // d'écraser une modification concurrente faite par quelqu'un d'autre
        // au même moment (deux employés qui saisissent en même temps, par exemple).
        await tx.stockItem.update({
          where: { id: dto.stockItemId },
          data: { quantity: { increment: dto.quantity } },
        });
      }

      // Ce qui est retourné ici devient la réponse HTTP renvoyée au client
      return production;
    });
  }

  async findAll(farmId: string, type?: string) {
    // farmId toujours présent dans le "where" : un utilisateur ne doit
    // jamais pouvoir lister les productions d'une autre ferme.
    // "type" est optionnel : si non fourni, Prisma l'ignore et retourne tout.
    return this.prisma.production.findMany({
      where: { farmId, type: type as never },
      include: { stockItem: true }, // évite un second appel pour connaître l'article lié
      orderBy: { date: 'desc' },    // les productions les plus récentes en premier
    });
  }

  async findOne(id: string, farmId: string) {
    // "findFirst" avec id ET farmId (pas "findUnique" avec juste id) :
    // empêche de récupérer une production d'une autre ferme même en
    // devinant son id — la requête ne la trouve simplement pas, elle
    // n'existe pas "pour cet utilisateur".
    const production = await this.prisma.production.findFirst({
      where: { id, farmId },
      include: { stockItem: true },
    });
    if (!production) {
      throw new NotFoundException('Production introuvable');
    }
    return production;
  }

  async update(id: string, dto: UpdateProductionDto, farmId: string) {
    // Réutilise findOne : vérifie à la fois que la production existe
    // ET qu'elle appartient bien à la ferme de l'utilisateur, avant
    // de tenter la moindre modification.
    await this.findOne(id, farmId);

    // dto ne contient que "notes" (voir UpdateProductionDto) — impossible
    // de modifier quantity ou stockItemId par cette route, par choix
    // volontaire (cohérent avec RG-06 : une quantité déjà répercutée
    // en stock ne se corrige jamais par simple édition).
    return this.prisma.production.update({ where: { id }, data: dto });
  }
}