import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

// Décalage horaire Madagascar — même principe que dashboard.service.ts,
// pour que "le mois de septembre" corresponde au calendrier réel de la
// ferme, pas à celui du serveur qui héberge l'application.
const MADAGASCAR_OFFSET_HOURS = 3;

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) {}

    // Calcule les bornes exactes d'un mois ("2026-09" → du 1er au 30
    // septembre inclus), en tenant compte du fuseau horaire local.
    private getMonthBounds(month: string): {debut: Date; fin: Date}
    {
        const [year, monthNum] = month.split('-').map(Number);

        // Premier jour du mois à 00h00, heure de Madagascar
        const debutMadagascar = new Date(Date.UTC(year, monthNum - 1, 1, 0, 0, 0, 0));
        const debut = new Date(debutMadagascar.getTime() - MADAGASCAR_OFFSET_HOURS * 60 * 60 * 1000);

         // Premier jour du mois SUIVANT moins 1ms = dernier instant du mois demandé
        const finMadagascar = new Date(Date.UTC(year, monthNum, 1, 0, 0, 0, 0));
        const fin = new Date(finMadagascar.getTime() - MADAGASCAR_OFFSET_HOURS * 60 * 60 * 1000 - 1)

        return {debut, fin};
    }

    async getMonthlyReport(farmId, month: string)
    {
        const {debut, fin} = this.getMonthBounds(month)
        // Toutes les sections sont indépendantes — si l'une échoue ou
        // renvoie vide (ex: table Paddy pas encore migrée au back), les
        // autres restent intactes
        const [production, finance, stock, cattle, poultry] = await Promise.all([
      this.getProductionSection(farmId, debut, fin),
      this.getFinanceSection(farmId, debut, fin),
      this.getStockSection(farmId, debut, fin),
      this.getCattleSection(farmId, debut, fin),
      this.getPoultrySection(farmId, debut, fin),
    ]);

    return {
      mois: month,
      periode: { debut, fin },
      production,
      finance,
      stock,
      cattle,
      poultry,
    };
    }

    private async getProductionSection(farmId: string, debut: Date, fin: Date)
    {
        // Regroupe TOUTE la production du mois par type (OEUFS, LAIT, VIANDE,
        // RECOLTES, POULARD, KUROILER...) — couvre automatiquement les
        // nouveaux types ajoutés par le schéma
        const parType = await this.prisma.production.groupBy({
            by: ['type'],
            where: {farmId, date: {gte: debut, lte: fin}},
            _sum: {quantity: true},
            _count: true,
        });

        return parType.map((p) => ({
            type: p.type,
            quantiteTotale: p._sum.quantity ?? 0,
            nombreSaisies: p._count,
        }));
    }

    private async getFinanceSection(farmId: string, debut: Date, fin: Date)
    {
        const [recettes, depenses] = await Promise.all([
            this.prisma.transaction.aggregate({
                where: {farmId, type: 'RECETTE', date: {gte: debut, lte: fin}},
                _sum: {amount: true},
            }),

            this.prisma.transaction.aggregate({
                where: {farmId, type: 'DEPENSE', date: {gte: debut, lte: fin}},
                _sum: {amount: true},
            }),
        ]);

        const totalRecettes = Number(recettes._sum.amount ?? 0);
        const totalDepenses = Number(depenses._sum.amount ?? 0);

        return {
            totalRecettes,
            totalDepenses,
            benefice: totalRecettes - totalDepenses,
        };
    }

    private async getStockSection(farmId: string, debut: Date, fin: Date)
    {
        const mouvementParType = await this.prisma.stockMovement.groupBy({
            by: ['type'],
            where: {item: {farmId}, date: {gte: debut, lte: fin}},
            _sum: {quantity: true},
            _count: true,
        });

        // Les alertes sont un état ACTUEL, pas une donnée du mois passé —
        // on les inclut quand même : un rapport de septembre consulté en
        // octobre doit montrer la situation de stock au moment de la lecture.
        const items = await this.prisma.stockItem.findMany({where: {farmId}});
        const articlesEnAlerte = items.filter((item) => item.quantity <= item.miniAlert);

        return {
            mouvementParType: mouvementParType.map((m) => ({
                type: m.type,
                quantiteTotale: m._sum.quantity ?? 0,
                nombreMouvements: m._count,
            })),
            nombreArticlesEnAlerte: articlesEnAlerte.length,
        };
    }

     private async getCattleSection(farmId: string, debut: Date, fin: Date) {
    const [ventes, deces, laitAgregat] = await Promise.all([
      this.prisma.cattle.aggregate({
        where: { farmId, status: 'VENDU', saleDate: { gte: debut, lte: fin } },
        _sum: { salePrice: true },
        _count: true,
      }),
      this.prisma.cattle.count({
        where: { farmId, status: 'DECEDE', deathDate: { gte: debut, lte: fin } },
      }),
      this.prisma.production.aggregate({
        where: { farmId, type: 'LAIT', date: { gte: debut, lte: fin } },
        _sum: { quantity: true },
      }),
    ]);

    return {
      nombreVentes: ventes._count,
      montantVentes: ventes._sum.salePrice ?? 0,
      nombreDeces: deces,
      laitTotalLitres: laitAgregat._sum.quantity ?? 0,
    };
  }

  private async getPoultrySection(farmId: string, debut: Date, fin: Date) {
    const [ventes, sorties, mortaliteAgregat] = await Promise.all([
      this.prisma.poultryTracking.aggregate({
        where: { farmId, status: 'VENDU', exitDate: { gte: debut, lte: fin } },
        _sum: { salePrice: true },
        _count: true,
      }),
      this.prisma.poultryTracking.count({
        where: { farmId, status: 'DECEDE', exitDate: { gte: debut, lte: fin } },
      }),
      // La mortalité hebdomadaire vit dans PoultryWeeklyRecord, pas
      // directement sur PoultryTracking — on doit passer par la relation
      // pour filtrer par ferme, puisque WeeklyRecord n'a pas farmId lui-même.
      this.prisma.poultryWeeklyRecord.aggregate({
        where: {
          poultryTracking: { farmId },
          recordDate: { gte: debut, lte: fin },
        },
        _sum: { mortalityCount: true },
      }),
    ]);

    return {
      nombreVentes: ventes._count,
      montantVentes: ventes._sum.salePrice ?? 0,
      nombreDecesDirects: sorties,
      mortaliteHebdomadaireCumulee: mortaliteAgregat._sum.mortalityCount ?? 0,
    };
  }

}