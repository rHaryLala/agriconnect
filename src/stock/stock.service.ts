import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';

const SEUIL_ECART_REPESAGE_PERCENT = 5;

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
  const item = await this.findOneItem(itemId, farmId);

  // Si le mouvement cible une variante précise (ex: "Oeufs GM Normal"),
  // on la charge et on vérifie DEUX choses distinctes : qu'elle existe
  // vraiment, ET qu'elle appartient bien à CET article — sans ce second
  // contrôle, n'importe quel variantId valide (même d'un autre article)
  // serait accepté silencieusement.
  let variant: { id: string; quantity: number } | null = null;
  if (dto.variantId) {
    variant = await this.prisma.productVariant.findFirst({
      where: { id: dto.variantId, stockItemId: itemId },
    });
    if (!variant) {
      throw new NotFoundException(
        'Variante introuvable, ou elle n\'appartient pas à cet article',
      );
    }
  }

  // Le contrôle de stock suffisant doit porter sur la BONNE quantité :
  // celle de la variante si elle est ciblée, celle de l'article sinon.
  // Les mélanger permettrait de vendre plus d'une variante qu'il n'en
  // reste réellement, tant que l'article parent a un total suffisant.
  if (dto.type === 'OUT') {
    const quantiteDisponible = variant ? variant.quantity : item.quantity;
    if (quantiteDisponible < dto.quantity) {
      throw new BadRequestException(
        `Stock insuffisant : ${quantiteDisponible} ${item.unit} disponible(s), ${dto.quantity} demandé(s)`,
      );
    }
  }

  const quantiteReelle = dto.repeseeQuantity ?? dto.quantity;

  return this.prisma.$transaction(async (tx) => {
    const movement = await tx.stockMovement.create({
      data: {
        itemId,
        type: dto.type,
        quantity: dto.quantity,
        repeseeQuantity: dto.repeseeQuantity,
        reason: dto.reason,
        variantId: dto.variantId,
        userId,
      },
    });

    if (dto.variantId) {
      await tx.productVariant.update({
        where: { id: dto.variantId },
        data:
          dto.type === 'AJUSTEMENT'
            ? { quantity: quantiteReelle }
            : { quantity: dto.type === 'IN' ? { increment: quantiteReelle } : { decrement: quantiteReelle } },
      });
    } else {
      await tx.stockItem.update({
        where: { id: itemId },
        data:
          dto.type === 'AJUSTEMENT'
            ? { quantity: quantiteReelle }
            : { quantity: dto.type === 'IN' ? { increment: quantiteReelle } : { decrement: quantiteReelle } },
      });
    }

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

 async historique(farmId: string, filters: { itemId?: string; type?: string; dateDebut?: string; dateFin?: string }) {
  return this.prisma.stockMovement.findMany({
    where: {
      item: { farmId },
      itemId: filters.itemId,
      type: filters.type as never,
      date: {
        gte: filters.dateDebut ? new Date(filters.dateDebut) : undefined,
        lte: filters.dateFin ? new Date(filters.dateFin) : undefined,
      },
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