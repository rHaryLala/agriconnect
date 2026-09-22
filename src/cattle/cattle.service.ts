import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCattleDto } from './dto/create-cattle.dto';
import { UpdateCattleDto } from './dto/update-cattle.dto';
import { SellCattleDto } from './dto/sell-cattle.dto';
import { RecordDeathDto } from './dto/record-death.dto';
import { CreateMilkRecordDto } from './dto/create-milk-record.dto';
@Injectable()
export class CattleService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCattleDto, farmId: string) {
    return this.prisma.cattle.create({
      data: {
        nameOrTag: dto.nameOrTag,
        gender: dto.gender,
        category: dto.category,
        entryType: dto.entryType,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        notes: dto.notes,
        farmId,
        // status garde sa valeur par défaut du schéma : EN_ELEVAGE
      },
    });
  }

  async findAll(farmId: string) {
    return this.prisma.cattle.findMany({ where: { farmId }, orderBy: { nameOrTag: 'asc' } });
  }

  async findOne(id: string, farmId: string) {
    const cattle = await this.prisma.cattle.findFirst({ where: { id, farmId } });
    if (!cattle) {
      throw new NotFoundException('Bovin introuvable');
    }
    return cattle;
  }

  async update(id: string, dto: UpdateCattleDto, farmId: string) {
    await this.findOne(id, farmId);
    return this.prisma.cattle.update({ where: { id }, data: dto });
  }

  // Vente : change le statut ET génère la recette correspondante,
  // dans une seule transaction (RG-05) 
  async sell(id: string, dto: SellCattleDto, userId: string, farmId: string) {
    const cattle = await this.findOne(id, farmId);

    if (cattle.status !== 'EN_ELEVAGE') {
      throw new BadRequestException(`Ce bovin est déjà ${cattle.status}, impossible de le vendre`);
    }

    // Vérifie que le client existe bien et appartient à la ferme —
    // jamais fait confiance à un UUID reçu sans vérification.
    const client = await this.prisma.client.findFirst({ where: { id: dto.clientId, farmId } });
    if (!client) {
      throw new NotFoundException('Client introuvable');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.cattle.update({
        where: { id },
        data: {
          status: 'VENDU',
          saleDate: new Date(),
          salePrice: dto.salePrice,
          clientId: dto.clientId,
          signature: dto.signature,
        },
      });

      // La recette générée automatiquement — le lien qui manquait.
      await tx.transaction.create({
        data: {
          type: 'RECETTE',
          amount: dto.salePrice,
          reference: `Vente bovin ${cattle.nameOrTag}`,
          notes: `Vente de bovin (${cattle.category ?? 'catégorie non précisée'})`,
          userId,
          farmId,
          clientId: dto.clientId,
        },
      });

      return updated;
    });
  }

  async recordDeath(id: string, dto: RecordDeathDto, farmId: string) {
    const cattle = await this.findOne(id, farmId);

    if (cattle.status !== 'EN_ELEVAGE') {
      throw new BadRequestException(`Ce bovin est déjà ${cattle.status}`);
    }

    return this.prisma.cattle.update({
      where: { id },
      data: { status: 'DECEDE', deathDate: new Date(), deathReason: dto.deathReason },
    });
  }

  async recordMilk(cattleId: string, dto:CreateMilkRecordDto, userId: string, farmId: string)
  {
    const cattle = await this.findOne(cattleId, farmId);

    if (dto.stockItemId)
    {
      const item = await this.prisma.stockItem.findFirst({
        where: {id: dto.stockItemId, farmId}
      });
      if (!item)
      {
        throw new NotFoundException('Article de stock introuvable');
      }
    }

    const date = dto.date ? new Date(dto.date) : new Date();

    return this.prisma.$transaction(async (tx) => {
      const production = await tx.production.create({
        data: {
          type: 'LAIT',
          quantity: dto.quantityL,
          unit: 'litre',
          notes: dto.notes,
          date,
          userId,
          farmId,
          stockItemId: dto.stockItemId,
          cattleId, // le lien qui rend l'agrégation par vache possible
        },
      });

      if (dto.stockItemId)
      {
        await tx.stockMovement.create({
          data: {
            itemId: dto.stockItemId,
            type: 'IN',
            quantity: dto.quantityL,
            reason: `Traite du ${date.toLocaleDateString()} - ${cattle.nameOrTag}`,
            userId,
          },
        });

        await tx.stockItem.update({
          where: {id: dto.stockItemId},
          data: {quantity: {increment: dto.quantityL}},
        });
      }

      return production;
    });
  }

  //Historique de traite de vache / Par vache
  async getMilkRecords(cattleId: string, farmId: string)
  {
    await this.findOne(cattleId, farmId) //Vérifie appartenance ferme + existence
    return this.prisma.production.findMany({
      where: {cattleId, type: 'LAIT'},
      orderBy: {date: 'desc'},
    });
  }

  // Agrégation troupeau — le "par troupeau" du besoin. Somme toute
  // la production laitière de la ferme sur une période, tous animaux
  // confondus, plus un détail par vache pour comparer les rendements.
  async getTroupeauMilkSummary(farmId: string, dateDebut?: string, dateFin?: string)
  {
    const where = {
      farmId,
      type: 'LAIT' as const,
      date: {
        gte: dateDebut ? new Date(dateDebut) : undefined,
        lte: dateFin ? new Date(dateFin) : undefined,
      },
    };

    const total = await this.prisma.production.aggregate({
      where,
      _sum: {quantity: true},
    });

    //Voir quelle vache produit le plus
    const parVache = await this.prisma.production.groupBy({
      by: ['cattleId'],
      where: {...where, cattleId: {not: null}},
      _sum: {quantity: true},
    });

    return {
      totalTroupeauLitres: total._sum.quantity ?? 0,
      parVache: parVache.map((v) => ({
        cattleId: v.cattleId,
        totalLitres: v._sum.quantity ?? 0,
      })),
    };
  }
}
