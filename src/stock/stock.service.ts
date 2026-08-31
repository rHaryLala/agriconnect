import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  // ---------- StockItem (le "catalogue" des articles) ----------

  async createItem(dto: CreateStockDto, farmId: string) {
    return this.prisma.stockItem.create({
      data: { ...dto, farmId },
    });
  }

  async findAllItems(farmId: string) {
    // C'est ça, "l'inventaire" du roadmap : l'état actuel de chaque article
    return this.prisma.stockItem.findMany({
      where: { farmId },
      orderBy: { name: 'asc' },
    });
  }

  async findOneItem(id: string, farmId: string) {
    const item = await this.prisma.stockItem.findFirst({ where: { id, farmId } });
    if (!item) {
      throw new NotFoundException('Article introuvable');
    }
    return item;
  }

  async updateItem(id: string, dto: UpdateStockDto, farmId: string) {
    await this.findOneItem(id, farmId); // vérifie existence + appartenance à la ferme
    return this.prisma.stockItem.update({ where: { id }, data: dto });
  }

  // ---------- StockMovement (entrées / sorties / ajustements) ----------

  async registerMovement(itemId: string, dto: CreateStockMovementDto, userId: string, farmId: string) {
    const item = await this.findOneItem(itemId, farmId); // réutilise la vérification ci-dessus

    // RG-02 : un OUT ne peut jamais rendre le stock négatif.
    // AJUSTEMENT (RG-03) est volontairement exclu de cette règle — c'est
    // justement fait pour corriger un écart, pas pour en créer un.
    if (dto.type === 'OUT' && item.quantity < dto.quantity) {
      throw new BadRequestException(
        `Stock insuffisant : ${item.quantity} ${item.unit} disponible(s), ${dto.quantity} demandé(s)`,
      );
    }

    // Choix de conception sur AJUSTEMENT : "quantity"
    // représente ici la NOUVELLE quantité absolue en stock (résultat d'un
    // comptage physique), pas une quantité à ajouter — c'est la seule façon
    // cohérente de gérer un écart qui peut aller dans les deux sens, alors
    // que le DTO impose @Min(0.01) (donc jamais de valeur négative).
    return this.prisma.$transaction(async (tx) => {
      const movement = await tx.stockMovement.create({
        data: {
          itemId,
          type: dto.type,
          quantity: dto.quantity,
          reason: dto.reason,
          userId,
        },
      });

      await tx.stockItem.update({
        where: { id: itemId },
        data:
          dto.type === 'AJUSTEMENT'
            ? { quantity: dto.quantity } // valeur absolue
            : dto.type === 'IN'
              ? { quantity: { increment: dto.quantity } }
              : { quantity: { decrement: dto.quantity } },
      });

      return movement;
    });
  }

  // RG-06 : corriger un mouvement déjà validé, jamais le supprimer.
  async correctMovement(movementId: string, reason: string, userId: string, farmId: string) {
    const original = await this.prisma.stockMovement.findFirst({
      where: { id: movementId, item: { farmId } }, // passe par la relation, StockMovement n'a pas farmId
      include: { item: true },
    });
    if (!original) {
      throw new NotFoundException('Mouvement introuvable');
    }

    // Le mouvement inverse : IN devient OUT et inversement. AJUSTEMENT ne
    // se corrige pas de cette façon (on referait plutôt un nouvel AJUSTEMENT).
    if (original.type === 'AJUSTEMENT') {
      throw new BadRequestException('Un ajustement se corrige par un nouvel ajustement, pas par une correction directe');
    }

    return this.prisma.$transaction(async (tx) => {
      const correction = await tx.stockMovement.create({
        data: {
          itemId: original.itemId,
          type: original.type === 'IN' ? 'OUT' : 'IN', // inverse exact
          quantity: original.quantity,
          reason,
          userId,
          originalMovmentId: original.id, // lien explicite vers l'erreur corrigée
        },
      });

      await tx.stockItem.update({
        where: { id: original.itemId },
        data:
          correction.type === 'IN'
            ? { quantity: { increment: original.quantity } }
            : { quantity: { decrement: original.quantity } },
      });

      return correction;
    });
  }

  async historique(farmId: string, filters: { itemId?: string; type?: string }) {
    return this.prisma.stockMovement.findMany({
      where: {
        item: { farmId },
        itemId: filters.itemId,
        type: filters.type as never,
      },
      include: { item: true, user: true },
      orderBy: { date: 'desc' },
    });
  }

  async alertes(farmId: string) {
    const items = await this.prisma.stockItem.findMany({ where: { farmId } });
    // miniAlert a une valeur par défaut (10) dans le schéma, donc pas besoin
    // de filtrer les null comme dans notre ancienne version — tous les
    // articles ont un seuil, ce qui simplifie cette méthode.
    return items.filter((item) => item.quantity <= item.miniAlert);
  }
}