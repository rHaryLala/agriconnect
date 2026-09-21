import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(farmId: string, dateStr?: string) {
    const date = dateStr ? new Date(dateStr) : new Date();

    const MADAGASCAR_OFFSET_HOURS = 3;

    const dateMadagascar = new Date(date.getTime() + MADAGASCAR_OFFSET_HOURS * 60 * 60 * 1000);
    const startOfDayMadagascar = new Date(Date.UTC(
      dateMadagascar.getUTCFullYear(),
      dateMadagascar.getUTCMonth(),
      dateMadagascar.getUTCDate(),
      0, 0, 0, 0,
    ));
    const startOfDay = new Date(startOfDayMadagascar.getTime() - MADAGASCAR_OFFSET_HOURS * 60 * 60 * 1000);
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

    // Production du jour
    const productions = await this.prisma.production.groupBy({
      by: ['type'],
      where: {
        farmId,
        date: { gte: startOfDay, lte: endOfDay },
      },
      _sum: { quantity: true },
    });

    // Stock critique
    const stockItems = await this.prisma.stockItem.findMany({ where: { farmId } });
    const stockCritique = stockItems.filter((item) => item.quantity <= item.miniAlert);

    // Solde de caisse
    const recettes = await this.prisma.transaction.aggregate({
      where: { farmId, type: 'RECETTE' },
      _sum: { amount: true },
    });
    const depenses = await this.prisma.transaction.aggregate({
      where: { farmId, type: 'DEPENSE' },
      _sum: { amount: true },
    });

    const totalRecettes = recettes._sum.amount ?? 0;
    const totalDepenses = depenses._sum.amount ?? 0;
    const soldeCaisse = totalRecettes - totalDepenses;

    return {
      date: startOfDay,
      productionDuJour: productions.map((p) => ({
        type: p.type,
        quantite: p._sum.quantity ?? 0,
      })),
      stockCritique: stockCritique.map((item) => ({
        id: item.id,
        nom: item.name,
        quantiteActuelle: item.quantity,
        seuil: item.miniAlert,
      })),
      soldeCaisse,
      indicateurs: {
        nombreAlertesStock: stockCritique.length,
        nombreTypesProduitsAujourdhui: productions.length,
      },
    };
  }
}