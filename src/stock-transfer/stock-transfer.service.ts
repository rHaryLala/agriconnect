import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransferDto } from './dto/create-transfer.dto';

@Injectable()
export class StockTransferService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTransferDto, userId: string, farmId: string) {
    // Vérifie que les deux emplacements existent et appartiennent à la ferme —
    // jamais fait confiance à un UUID reçu sans vérification.
    const [from, to] = await Promise.all([
      this.prisma.stockLocation.findFirst({ where: { id: dto.fromLocationId, farmId } }),
      this.prisma.stockLocation.findFirst({ where: { id: dto.toLocationId, farmId } }),
    ]);
    if (!from) throw new NotFoundException('Emplacement source introuvable');
    if (!to) throw new NotFoundException('Emplacement destination introuvable');
    if (from.id === to.id) throw new BadRequestException('Source et destination identiques');

    // Numéro de reçu séquentiel — même principe que Payment.recuNumber,
    // basé sur le nombre de transferts déjà existants pour cette ferme.
    const count = await this.prisma.stockTransfer.count({ where: { fromLocation: { farmId } } });
    const transfertNumber = `TRF-${String(count + 1).padStart(5, '0')}`;

    // Toute l'opération dans UNE transaction : le transfert, ses lignes,
    // et les 2 mouvements de stock (OUT source + IN destination) par
    // article doivent réussir ensemble ou pas du tout (RG-05).
    return this.prisma.$transaction(async (tx) => {
      // Vérifie le stock disponible AVANT de créer quoi que ce soit —
      // évite de devoir annuler un transfert à moitié créé.
      for (const line of dto.items) {
        const item = await tx.stockItem.findFirst({ where: { id: line.itemId, farmId } });
        if (!item) throw new NotFoundException(`Article ${line.itemId} introuvable`);
        if (item.quantity < line.quantity) {
          throw new BadRequestException(`Stock insuffisant pour ${item.name}`);
        }
      }

      const transfer = await tx.stockTransfer.create({
        data: {
          transfertNumber,
          fromLocationId: dto.fromLocationId,
          toLocationId: dto.toLocationId,
          senderId: userId,
          status: 'PENDING', // le transfert démarre "en attente" — voir méthode confirm() plus bas
        },
      });

      // Une ligne StockTransferItem + un mouvement OUT par article du transfert.
      // Pas de mouvement IN tout de suite : tant que personne n'a confirmé la
      // réception côté destination, la marchandise est en TRANSIT, pas encore arrivée.
      for (const line of dto.items) {
        await tx.stockTransferItem.create({
          data: { transfertId: transfer.id, itemId: line.itemId, quantity: line.quantity },
        });

        await tx.stockMovement.create({
          data: {
            itemId: line.itemId,
            type: 'TRANFERTS',
            quantity: line.quantity,
            reason: `Transfert ${transfertNumber} vers ${to.name}`,
            userId,
            transfertId: transfer.id,
          },
        });

        // Décrémente le stock à la source — la quantité "disparaît" de
        // la Ferme dès l'envoi, avant même que le Magasinier ne la reçoive.
        await tx.stockItem.update({
          where: { id: line.itemId },
          data: { quantity: { decrement: line.quantity } },
        });
      }

      return transfer;
    });
  }

  // Confirme la réception à destination : crée le mouvement IN,
  // incrémente le stock du côté receveur, clôture le transfert.
  async confirm(transferId: string, userId: string, farmId: string) {
    const transfer = await this.prisma.stockTransfer.findFirst({
      where: { id: transferId, fromLocation: { farmId } },
      include: { items: true },
    });
    if (!transfer) throw new NotFoundException('Transfert introuvable');
    if (transfer.status !== 'PENDING') {
      throw new BadRequestException(`Transfert déjà ${transfer.status}`);
    }

    return this.prisma.$transaction(async (tx) => {
      for (const line of transfer.items) {
        await tx.stockMovement.create({
          data: {
            itemId: line.itemId,
            type: 'IN',
            quantity: line.quantity,
            reason: `Réception transfert ${transfer.transfertNumber}`,
            userId,
            transfertId: transfer.id,
          },
        });
        await tx.stockItem.update({
          where: { id: line.itemId },
          data: { quantity: { increment: line.quantity } },
        });
      }

      return tx.stockTransfer.update({
        where: { id: transferId },
        data: { status: 'COMPLETED', receiverId: userId },
      });
    });
  }

  async findAll(farmId: string) {
    return this.prisma.stockTransfer.findMany({
      where: { fromLocation: { farmId } },
      include: { items: true, fromLocation: true, toLocation: true },
      orderBy: { date: 'desc' },
    });
  }
}