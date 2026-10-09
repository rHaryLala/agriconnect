import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import { resolve } from "path";
import { rejects } from "assert";

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

    // Génère le PDF en mémoire (un Buffer), sans jamais écrire de fichier
    // sur le disque du serveur — plus simple à nettoyer, rien à supprimer après coup.
    async generateMonthlyReportPdf(farmId: string, month: string): Promise<Buffer> {
      const report = await this.getMonthlyReport(farmId, month);

      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({margin: 50});
        const chunks: Buffer[] = [];

          // pdfkit construit le document de façon événementielle : chaque
          // morceau généré arrive via "data", on les accumule pour les
          // recoller en un seul Buffer à la fin ("end").
          doc.on('data', (chunk) => chunks.push(chunk))
          doc.on('end', () => resolve(Buffer.concat(chunks)));
          doc.on('error', reject);

          //--En-tête--
          doc.fontSize(20).text('Rapport mensuel consolidé', { align: 'center' });
    doc.fontSize(12).fillColor('gray').text(`Période : ${month}`, { align: 'center' });
    doc.moveDown(2);
    doc.fillColor('black');

    // --- Section Production ---
    doc.fontSize(16).text('Production');
    doc.moveDown(0.5);
    if (report.production.length === 0) {
      doc.fontSize(11).fillColor('gray').text('Aucune production ce mois-ci.');
      doc.fillColor('black');
    } else {
      report.production.forEach((p) => {
        doc.fontSize(11).text(`${p.type} : ${p.quantiteTotale} (${p.nombreSaisies} saisie(s))`);
      });
    }
    doc.moveDown(1.5);

    // --- Section Finance ---
    doc.fontSize(16).text('Finance');
    doc.moveDown(0.5);
    doc.fontSize(11).text(`Recettes : ${report.finance.totalRecettes.toLocaleString('fr-FR')} Ar`);
    doc.text(`Dépenses : ${report.finance.totalDepenses.toLocaleString('fr-FR')} Ar`);
    doc.fontSize(12).fillColor(report.finance.benefice >= 0 ? 'green' : 'red')
      .text(`Bénéfice : ${report.finance.benefice.toLocaleString('fr-FR')} Ar`);
    doc.fillColor('black');
    doc.moveDown(1.5);

    // --- Section Stock ---
    doc.fontSize(16).text('Stock');
    doc.moveDown(0.5);
    report.stock.mouvementParType.forEach((m) => {
      doc.fontSize(11).text(`${m.type} : ${m.quantiteTotale} (${m.nombreMouvements} mouvement(s))`);
    });
    doc.fontSize(11).fillColor(report.stock.nombreArticlesEnAlerte > 0 ? 'red' : 'black')
      .text(`Articles en alerte : ${report.stock.nombreArticlesEnAlerte}`);
    doc.fillColor('black');
    doc.moveDown(1.5);

    // --- Section Bovins ---
    doc.fontSize(16).text('Bovins');
    doc.moveDown(0.5);
    doc.fontSize(11).text(`Ventes : ${report.cattle.nombreVentes} (${report.cattle.montantVentes.toLocaleString('fr-FR')} Ar)`);
    doc.text(`Décès : ${report.cattle.nombreDeces}`);
    doc.text(`Lait produit : ${report.cattle.laitTotalLitres} L`);
    doc.moveDown(1.5);

    // --- Section Volailles ---
    doc.fontSize(16).text('Volailles');
    doc.moveDown(0.5);
    doc.fontSize(11).text(`Ventes : ${report.poultry.nombreVentes} (${report.poultry.montantVentes.toLocaleString('fr-FR')} Ar)`);
    doc.text(`Décès directs : ${report.poultry.nombreDecesDirects}`);
    doc.text(`Mortalité hebdomadaire cumulée : ${report.poultry.mortaliteHebdomadaireCumulee}`);

    // Termine le document — déclenche l'événement "end" plus haut
    doc.end();
  });
    }

    // Génère le classeur Excel en mémoire, une feuille par section pour
// rester lisible — plus pratique à consulter qu'un unique tableau
// géant mélangeant des colonnes de nature différente.
async generateMonthlyReportExcel(farmId: string, month: string): Promise<Buffer> {
  const report = await this.getMonthlyReport(farmId, month);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AgriConnect';
  workbook.created = new Date();

  // --- Feuille Résumé ---
  const resume = workbook.addWorksheet('Résumé');
  resume.columns = [
    { header: 'Indicateur', key: 'label', width: 35 },
    { header: 'Valeur', key: 'value', width: 20 },
  ];
  resume.addRows([
    { label: 'Période', value: month },
    { label: 'Total recettes (Ar)', value: report.finance.totalRecettes },
    { label: 'Total dépenses (Ar)', value: report.finance.totalDepenses },
    { label: 'Bénéfice (Ar)', value: report.finance.benefice },
    { label: 'Articles en alerte de stock', value: report.stock.nombreArticlesEnAlerte },
  ]);
  resume.getRow(1).font = { bold: true }; // met les en-têtes en gras

  // --- Feuille Production ---
  const production = workbook.addWorksheet('Production');
  production.columns = [
    { header: 'Type', key: 'type', width: 20 },
    { header: 'Quantité totale', key: 'quantiteTotale', width: 20 },
    { header: 'Nombre de saisies', key: 'nombreSaisies', width: 20 },
  ];
  production.addRows(report.production);
  production.getRow(1).font = { bold: true };

  // --- Feuille Stock ---
  const stock = workbook.addWorksheet('Stock');
  stock.columns = [
    { header: 'Type de mouvement', key: 'type', width: 20 },
    { header: 'Quantité totale', key: 'quantiteTotale', width: 20 },
    { header: 'Nombre de mouvements', key: 'nombreMouvements', width: 22 },
  ];
  stock.addRows(report.stock.mouvementParType);
  stock.getRow(1).font = { bold: true };

  // --- Feuille Bovins & Volailles ---
  const elevage = workbook.addWorksheet('Élevage');
  elevage.columns = [
    { header: 'Filière', key: 'filiere', width: 15 },
    { header: 'Ventes (nombre)', key: 'ventesNb', width: 18 },
    { header: 'Ventes (Ar)', key: 'ventesMontant', width: 18 },
    { header: 'Décès', key: 'deces', width: 12 },
  ];
  elevage.addRows([
    {
      filiere: 'Bovins', ventesNb: report.cattle.nombreVentes,
      ventesMontant: report.cattle.montantVentes, deces: report.cattle.nombreDeces,
    },
    {
      filiere: 'Volailles', ventesNb: report.poultry.nombreVentes,
      ventesMontant: report.poultry.montantVentes, deces: report.poultry.nombreDecesDirects,
    },
  ]);
  elevage.getRow(1).font = { bold: true };

  // ExcelJS écrit directement dans un buffer, comme pdfkit — le type
  // exact renvoyé par la lib est un ArrayBuffer, converti explicitement
  // en Buffer Node pour rester cohérent avec la méthode PDF ci-dessus.
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
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
            quantiteTotale: Number(p._sum.quantity ?? 0),
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
      montantVentes: Number(ventes._sum.salePrice ?? 0),
      nombreDeces: deces,
      laitTotalLitres: Number(laitAgregat._sum.quantity ?? 0),
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
      montantVentes: Number(ventes._sum.salePrice ?? 0),
      nombreDecesDirects: sorties,
      mortaliteHebdomadaireCumulee: mortaliteAgregat._sum.mortalityCount ?? 0,
    };
  }

}