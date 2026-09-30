import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { CreatePurchaseDto } from "./dto/create-purchase.dto";
import { CreateSupplierPaymentDto } from "./dto/create-supplier-payment.dto";

@Injectable()
export class SupplierService {
    constructor(private prisma: PrismaService) {}

    //-------------Supplier------------------
    async create(dto: CreateSupplierDto, farmId: string)
    {
        return this.prisma.supplier.create({data: {...dto, farmId}});
    }

    async findAll(farmId: string)
    {
        return this.prisma.supplier.findMany({
            where: {farmId},
            orderBy: {name: 'asc'}
        });
    }

    async findOne(id: string, farmId: string)
    {
        const supplier = await this.prisma.supplier.findFirst({where: {id, farmId}});
        if (!supplier)
        {
            throw new NotFoundException('Fournisseur introuvable');
        }
        return supplier;
    }

    //Reproduction des totaux (total payé, Achat en attentes, Total achats) calculé à la demande bien sur
    async findOneWithSummary(id: string, farmId: string)
    {
        const supplier = await this.findOne(id, farmId);

        const purchases = await this.prisma.supplierPurchase.findMany({
            where: {supplierId: id},
            orderBy: {date: 'desc'},
        })

        const totalAchats = purchases.reduce((sum, p) => sum + Number(p.totalAmount), 0);
        const totalPaye = purchases.reduce((sum, p) => sum + Number(p.paidAmount), 0);
        const enAttente = purchases.filter((p) => p.status !== 'REGLE');

          return {
      ...supplier,
      totalAchats,
      totalPaye,
      nombreAchatsEnAttente: enAttente.length,
      montantEnAttente: enAttente.reduce((sum, p) => sum + (Number(p.totalAmount) - Number(p.paidAmount)), 0),
      dernierAchat: purchases[0]?.date ?? null,
      purchases,
    };
  }

  async update(id: string, dto: UpdateSupplierDto, farmId: string) {
    await this.findOne(id, farmId);
    return this.prisma.supplier.update({ where: { id }, data: dto });
  }

  // ---------- SupplierPurchase ----------

  async createPurchase(supplierId: string, dto: CreatePurchaseDto, farmId: string) {
    await this.findOne(supplierId, farmId); // vérifie existence + appartenance à la ferme

    // Numérotation séquentielle par ferme, générée ici — jamais reçue
    // du client (voir commentaire du DTO).
    const count = await this.prisma.supplierPurchase.count({ where: { farmId } });
    const reference = `ACH-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    return this.prisma.supplierPurchase.create({
      data: {
        reference,
        description: dto.description,
        totalAmount: dto.totalAmount,
        date: dto.date ? new Date(dto.date) : undefined,
        supplierId,
        farmId,
        // paidAmount et status gardent leurs valeurs par défaut du
        // schéma (0 et EN_ATTENTE) — un achat vient d'être créé, rien
        // n'est encore payé.
      },
    });
  }

  async findPurchases(supplierId: string, farmId: string) {
    await this.findOne(supplierId, farmId);
    return this.prisma.supplierPurchase.findMany({
      where: { supplierId },
      include: { supplierPayments: true },
      orderBy: { date: 'desc' },
    });
  }

  private async findPurchaseOrThrow(purchaseId: string, farmId: string) {
    const purchase = await this.prisma.supplierPurchase.findFirst({
      where: { id: purchaseId, farmId },
    });
    if (!purchase) {
      throw new NotFoundException('Achat introuvable');
    }
    return purchase;
  }

  // ---------- SupplierPayment ----------

  async recordPayment(purchaseId: string, dto: CreateSupplierPaymentDto, farmId: string) {
    const purchase = await this.findPurchaseOrThrow(purchaseId, farmId);

    const montantRestant = Number(purchase.totalAmount) - Number(purchase.paidAmount);
    if (dto.amount > montantRestant) {
      throw new BadRequestException(
        `Le paiement (${dto.amount}) dépasse le montant restant dû (${montantRestant})`,
      );
    }

    // Recalcule le statut ET le montant payé dans la même transaction
    // que la création du paiement — même principe que Payment/Invoice
    // déjà fait pour les clients.
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.supplierPayment.create({
        data: {
          amount: dto.amount,
          method: dto.method,
          date: dto.date ? new Date(dto.date) : undefined,
          purchaseId,
          userId,
        },
      });

      const nouveauPaye = Number(purchase.paidAmount) + dto.amount;
      const nouveauStatut =
        nouveauPaye >= Number(purchase.totalAmount)
          ? 'REGLE'
          : nouveauPaye > 0
            ? 'PARTIEL'
            : 'EN_ATTENTE';

      await tx.supplierPurchase.update({
        where: { id: purchaseId },
        data: { paidAmount: nouveauPaye, status: nouveauStatut },
      });

      return payment;
    });
  }

  async findPayments(purchaseId: string, farmId: string) {
    await this.findPurchaseOrThrow(purchaseId, farmId);
    return this.prisma.supplierPayment.findMany({
      where: { purchaseId },
      orderBy: { date: 'desc' },
    });
  } 
}
