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

  if (dto.type === 'OUT' && item.quantity < dto.quantity) {
    throw new BadRequestException(
      `Stock insuffisant : ${item.quantity} ${item.unit} disponible(s), ${dto.quantity} demandé(s)`,
    );
  }

  const quantiteReelle = dto.repeseeQuantity ?? dto.quantity;

  // Calcul de l'écart, uniquement pertinent pour une réception (IN) avec
  // repesage renseigné — pas pour une sortie ou un ajustement, qui n'ont
  // pas de "quantité annoncée" à comparer.
  let alerteEcart: { pourcentage: number; message: string } | null = null;
  if (dto.type === 'IN' && dto.repeseeQuantity !== undefined && dto.quantity > 0) {
    const ecartPercent = Math.abs(dto.quantity - dto.repeseeQuantity) / dto.quantity * 100;
    if (ecartPercent > SEUIL_ECART_REPESAGE_PERCENT) {
      alerteEcart = {
        pourcentage: Math.round(ecartPercent * 10) / 10, // arrondi à 1 décimale
        message: `Écart de ${Math.round(ecartPercent)}% entre la quantité annoncée (${dto.quantity}) et repesée (${dto.repeseeQuantity})`,
      };
    }
  }

  const movement = await this.prisma.$transaction(async (tx) => {
    const m = await tx.stockMovement.create({
      data: {
        itemId, type: dto.type, quantity: dto.quantity,
        repeseeQuantity: dto.repeseeQuantity, reason: dto.reason,
        variantId: dto.variantId, userId,
      },
    });

    const target = dto.variantId
      ? tx.productVariant.update({
          where: { id: dto.variantId },
          data: dto.type === 'AJUSTEMENT' ? { quantity: quantiteReelle }
            : { quantity: dto.type === 'IN' ? { increment: quantiteReelle } : { decrement: quantiteReelle } },
        })
      : tx.stockItem.update({
          where: { id: itemId },
          data: dto.type === 'AJUSTEMENT' ? { quantity: quantiteReelle }
            : { quantity: dto.type === 'IN' ? { increment: quantiteReelle } : { decrement: quantiteReelle } },
        });
    await target;

    return m;
  });

  // L'alerte n'empêche jamais l'enregistrement — elle informe seulement,
  // sur-le-champ, la personne qui réceptionne. Ne pas bloquer une vraie
  // livraison pour un écart de pesée serait disproportionné.
  return { ...movement, alerteEcart };
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