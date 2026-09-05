import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
    // On injecte PrismaService directement, sans passer par StockService/
  // ProductionService/FinanceService. Raison : un tableau de bord est
  // purement en LECTURE
  constructor(private prisma: PrismaService) {}

  async getSummary(farmId: string, dateStr?: string)
  {
    const date = dateStr ? new Date(dateStr): new Date();

    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0 , 0) //Reset the time to midnight

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    //Production du jour
    const productions = await this.prisma.production.groupBy({
      by: ['type'], // regroupe les résultats par valeur du champ "type"
      where: {
        farmId, //Jamais les données d'une autre ferme
        date: {gte: startOfDay, lte: endOfDay}, //Toujours le jour demandé 
      },
      _sum: {quantity: true}, //Aditionner les quantités de chaque groupe
    });

    //Stock critique 
    const stockItems = await this.prisma.stockItem.findMany({where: {farmId}});

    const stockCritique = stockItems.filter((item) => item.quantity <= item.miniAlert);

    // . Solde de caisse : total recettes moins total dépenses, depuis
    // le tout début (pas juste aujourd'hui — un solde de caisse est cumulatif)
    const recettes = await this.prisma.transaction.aggregate({
      where: {farmId, type: 'RECETTE'},
      _sum: {amount: true} // aggregate et _sum font le calcul à la base
    });

    const depenses = await this.prisma.transaction.aggregate({
      where: {farmId, type:'DEPENSE'},
      _sum: {amount: true},
    });

    // "?? 0" : si aucune transaction n'existe encore pour cette ferme,
    // Prisma renvoie "null" (pas 0) (Bonne pratique apparement)
    const totalRecettes = recettes._sum.amount ?? 0;
    const totalDepenses = depenses._sum.amount ?? 0;
    const soldeCaisse = totalRecettes - totalDepenses;

     //Ce qu'on renvoie au frontend, tout regroupé en une seule réponse ---
     return {
      date: startOfDay,
       // .map() transforme chaque résultat groupé Prisma (qui a une forme
      // technique un peu verbeuse) en un objet simple et lisible pour le front
      productionDuJour: productions.map((p) => ({
        type: p.type,
        quantite: p._sum.quantity ?? 0
      })),

        stockCritique: stockCritique.map((item) => ({
        id: item.id,
        nom: item.name,
        quantiteActuelle: item.quantity,
        seuil: item.miniAlert,
      })),

       soldeCaisse,

      // Quelques compteurs simples, pratiques pour des badges ou pastilles
      // dans l'interface (ex: "3 alertes" affiché en rouge sur une icône)
      indicateurs: {
        nombreAlertesStock: stockCritique.length,
        nombreTypesProduitsAujourdhui: productions.length,
      },
     }
  }
}

    