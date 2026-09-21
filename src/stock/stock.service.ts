import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';

const SEUIL_ECART_REPESAGE_PERCENT = 5;

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  // ---------- StockItem ----------

  async createItem(dto: CreateStockDto, farmId: string) {
    return this.prisma.stockItem.create({ data: { ...dto, farmId } });
  }

  async findAllItems(farmId: string) {
  const items = await this.prisma.stockItem.findMany({
    where: { farmId },
    orderBy: { name: 'asc' },
  });

  // Même correctif que dans alertes() : la quantité affichée doit
  // toujours être la vraie, recalculée depuis les variantes pour les
  // articles qui en ont — jamais le champ "quantity" brut, périmé
  // dès qu'un mouvement cible une variante plutôt que l'article.
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      quantity: await this.quantiteReelleItem(item.id),
    })),
  );
}

  // Version "légère" — vérifie juste l'existence, ne recalcule rien.
// C'est CELLE-CI que les autres méthodes du service doivent continuer
// à utiliser en interne (updateItem, registerMovement, correctMovement).
async findOneItem(id: string, farmId: string) {
  const item = await this.prisma.stockItem.findFirst({ where: { id, farmId } });
  if (!item) {
    throw new NotFoundException('Article introuvable');
  }
  return item;
}

// pour un vrai affichage utilisateur uniquement
// (l'endpoint GET /stock/items/:id du contrôleur, pas les usages internes).
async findOneItemDetail(id: string, farmId: string) {
  const item = await this.findOneItem(id, farmId);
  return { ...item, quantity: await this.quantiteReelleItem(id) };
}

  async updateItem(id: string, dto: UpdateStockDto, farmId: string) {
    await this.findOneItem(id, farmId);
    return this.prisma.stockItem.update({ where: { id }, data: dto });
  }

  // Nouvelle méthode utilitaire : la quantité "réelle" d'un article,
  // en tenant compte de ses variantes s'il en a. Utilisée par alertes()
  // ci-dessous, réutilisable partout ailleurs où la vraie quantité compte.
  private async quantiteReelleItem(itemId: string): Promise<number> {
    const variants = await this.prisma.productVariant.findMany({ where: { stockItemId: itemId } });
    if (variants.length === 0) {
      const item = await this.prisma.stockItem.findUnique({ where: { id: itemId } });
      return item?.quantity ?? 0;
    }
    // Un article à variantes : sa vraie quantité est la somme de ses
    // variantes, jamais son propre champ "quantity" (qui n'est plus
    // mis à jour dès qu'un mouvement cible une variante).
    return variants.reduce((total, v) => total + v.quantity, 0);
  }

  // ---------- StockMovement ----------

  async registerMovement(itemId: string, dto: CreateStockMovementDto, userId: string, farmId: string) {
    const item = await this.findOneItem(itemId, farmId);

    let variant: { id: string; quantity: number } | null = null;
    if (dto.variantId) {
      variant = await this.prisma.productVariant.findFirst({
        where: { id: dto.variantId, stockItemId: itemId },
      });
      if (!variant) {
        throw new NotFoundException('Variante introuvable, ou elle n\'appartient pas à cet article');
      }
    }

    if (dto.type === 'OUT') {
      const quantiteDisponible = variant ? variant.quantity : item.quantity;
      if (quantiteDisponible < dto.quantity) {
        throw new BadRequestException(
          `Stock insuffisant : ${quantiteDisponible} ${item.unit} disponible(s), ${dto.quantity} demandé(s)`,
        );
      }
    }

    const quantiteReelle = dto.repeseeQuantity ?? dto.quantity;

    // Restauré : l'alerte d'écart au repesage (Semaine 1), qui avait
    // disparu du fichier. Uniquement pertinente sur une réception (IN)
    // avec repesage renseigné.
    let alerteEcart: { pourcentage: number; message: string } | null = null;
    if (dto.type === 'IN' && dto.repeseeQuantity !== undefined && dto.quantity > 0) {
      const ecartPercent = Math.abs(dto.quantity - dto.repeseeQuantity) / dto.quantity * 100;
      if (ecartPercent > SEUIL_ECART_REPESAGE_PERCENT) {
        alerteEcart = {
          pourcentage: Math.round(ecartPercent * 10) / 10,
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

      if (dto.variantId) {
        await tx.productVariant.update({
          where: { id: dto.variantId },
          data: dto.type === 'AJUSTEMENT' ? { quantity: quantiteReelle }
            : { quantity: dto.type === 'IN' ? { increment: quantiteReelle } : { decrement: quantiteReelle } },
        });
      } else {
        await tx.stockItem.update({
          where: { id: itemId },
          data: dto.type === 'AJUSTEMENT' ? { quantity: quantiteReelle }
            : { quantity: dto.type === 'IN' ? { increment: quantiteReelle } : { decrement: quantiteReelle } },
        });
      }

      return m;
    });

    return { ...movement, alerteEcart };
  }

  // RG-06 : corriger un mouvement déjà validé, jamais le supprimer.
  async correctMovement(movementId: string, reason: string, userId: string, farmId: string) {
    const original = await this.prisma.stockMovement.findFirst({
      where: { id: movementId, item: { farmId } },
      include: { item: true },
    });
    if (!original) {
      throw new NotFoundException('Mouvement introuvable');
    }
    if (original.type === 'AJUSTEMENT') {
      throw new BadRequestException('Un ajustement se corrige par un nouvel ajustement, pas par une correction directe');
    }

    return this.prisma.$transaction(async (tx) => {
      const correction = await tx.stockMovement.create({
        data: {
          itemId: original.itemId,
          type: original.type === 'IN' ? 'OUT' : 'IN',
          quantity: original.quantity,
          reason,
          userId,
          variantId: original.variantId, // ajouté : reporte la variante d'origine
          originalMovmentId: original.id,
        },
      });

      // Corrige la BONNE cible : la variante si le mouvement original
      // en ciblait une, l'article générique sinon — même logique que
      // dans registerMovement.
      if (original.variantId) {
        await tx.productVariant.update({
          where: { id: original.variantId },
          data: correction.type === 'IN'
            ? { quantity: { increment: original.quantity } }
            : { quantity: { decrement: original.quantity } },
        });
      } else {
        await tx.stockItem.update({
          where: { id: original.itemId },
          data: correction.type === 'IN'
            ? { quantity: { increment: original.quantity } }
            : { quantity: { decrement: original.quantity } },
        });
      }

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

    // Pour chaque article, on compare son SEUIL à sa quantité RÉELLE —
    // recalculée depuis les variantes si l'article en a, plutôt que
    // lue directement sur un champ qui peut être périmé.
    const resultats = await Promise.all(
      items.map(async (item) => {
        const quantiteReelle = await this.quantiteReelleItem(item.id);
        return { ...item, quantity: quantiteReelle };
      }),
    );

    return resultats.filter((item) => item.quantity <= item.miniAlert);
  }
}