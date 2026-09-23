import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaddyProcessDto } from './dto/create-paddy-process.dto';
import { CreateDryingWaveDto } from './dto/create-drying-wave.dto';
import { CreateMillingDto } from './dto/create-milling.dto';

/**
 * Stack : service NestJS (`@Injectable`), seul endroit du module qui parle à la
 * base via PrismaService. Le contrôleur ne fait que router, le DTO ne fait que
 * valider la forme — les règles métier sont toutes ici, et c'est ce qui les rend
 * testables sans passer par HTTP.
 *
 * Métier : la filière riz suit trois stocks successifs (voir rizCalc.ts côté
 * front). Ce service est responsable de les faire avancer de façon cohérente :
 * chaque écriture qui touche deux tables passe par $transaction, pour qu'un
 * décorticage ne puisse jamais être enregistré sans son mouvement de stock.
 */
@Injectable()
export class PaddyService {
  constructor(private prisma: PrismaService) {}

  /**
   * Recalcule les trois stocks d'un lot à partir de son historique.
   *
   * Volontairement dérivé et jamais stocké : un solde stocké se désynchronise
   * dès qu'un événement est corrigé, alors qu'un solde recalculé ne peut pas
   * mentir. Les cumuls présents sur PaddyProcess (driedPaddyKg, riceOutputKg)
   * ne servent qu'à l'affichage des listes, pas au contrôle de disponibilité.
   */
  private calculerStocks(process: {
    paddyInputKg: number;
    dryingWaves: { type: string; dryPaddyKg: number | null }[];
    millings: { paddyUsedKg: number; riceOutputKg: number }[];
  }) {
    const paddySecProduit = process.dryingWaves
      .filter((w) => w.type === 'FINALISATION')
      .reduce((total, w) => total + (w.dryPaddyKg ?? 0), 0);

    const paddySecConsomme = process.millings.reduce((total, m) => total + m.paddyUsedKg, 0);
    const rizProduit = process.millings.reduce((total, m) => total + m.riceOutputKg, 0);

    return {
      // Paddy récolté qui n'est pas encore passé en finalisation de séchage.
      stockPaddyBrutKg: process.paddyInputKg - paddySecProduit,
      // Paddy sec disponible : séché mais pas encore décortiqué.
      stockPaddySecKg: paddySecProduit - paddySecConsomme,
      // Riz produit par ce lot. Le riz vendu est retranché côté stock de
      // l'article, pas ici : la vente ne connaît que l'article, pas le lot.
      rizProduitKg: rizProduit,
    };
  }

  async create(dto: CreatePaddyProcessDto, userId: string, farmId: string) {
    // Le numéro de lot est unique par ferme (@@unique([farmId, lotNumber])).
    // On teste avant d'écrire pour renvoyer un message métier plutôt que la
    // violation de contrainte brute de PostgreSQL.
    const existant = await this.prisma.paddyProcess.findFirst({
      where: { farmId, lotNumber: dto.lotNumber },
    });
    if (existant) {
      throw new BadRequestException(`Le lot ${dto.lotNumber} existe déjà sur cette ferme`);
    }

    return this.prisma.paddyProcess.create({
      data: {
        lotNumber: dto.lotNumber,
        paddyInputKg: dto.paddyInputKg,
        paddyInputLot: dto.paddyInputLot,
        harvestDate: dto.harvestDate ? new Date(dto.harvestDate) : undefined,
        transport: dto.transport,
        driverName: dto.driverName,
        storekeeperName: dto.storekeeperName,
        note: dto.note,
        userId,
        farmId,
      },
    });
  }

  async findAll(farmId: string, status?: string) {
    const lots = await this.prisma.paddyProcess.findMany({
      // farmId vient toujours du JWT : c'est ce filtre, répété sur chaque
      // requête, qui empêche une ferme de lire les lots d'une autre.
      where: { farmId, ...(status ? { status: status as never } : {}) },
      include: { dryingWaves: true, millings: true },
      orderBy: { harvestDate: 'desc' },
    });

    return lots.map((lot) => ({ ...lot, ...this.calculerStocks(lot) }));
  }

  async findOne(id: string, farmId: string) {
    const lot = await this.prisma.paddyProcess.findFirst({
      where: { id, farmId },
      include: {
        dryingWaves: { orderBy: { date: 'asc' } },
        millings: { orderBy: { date: 'asc' } },
      },
    });
    if (!lot) {
      throw new NotFoundException('Lot de paddy introuvable');
    }
    return { ...lot, ...this.calculerStocks(lot) };
  }

  /**
   * Ajoute une vague de séchage au lot.
   *
   * C'est ici que vivent les règles que le DTO ne peut pas exprimer, parce
   * qu'elles dépendent de la valeur de `type` et de l'état du lot.
   */
  async addDryingWave(processId: string, dto: CreateDryingWaveDto, userId: string, farmId: string) {
    const lot = await this.findOne(processId, farmId);

    if (lot.status === 'COMPLETED') {
      throw new BadRequestException('Ce lot est clôturé : plus aucune vague ne peut y être ajoutée');
    }

    if (dto.type === 'PASSAGE') {
      if (dto.quantityOutKg === undefined || dto.quantityReturnedKg === undefined) {
        throw new BadRequestException(
          'Un passage au séchage exige la quantité sortie et la quantité retournée',
        );
      }
      // Le paddy perd de l'eau au séchage, il n'en gagne jamais. Un retour
      // supérieur à la sortie est donc une erreur de saisie ou de pesée, pas
      // une situation métier possible.
      if (dto.quantityReturnedKg > dto.quantityOutKg) {
        throw new BadRequestException(
          'La quantité retournée ne peut pas dépasser la quantité sortie : le séchage fait perdre du poids',
        );
      }
    }

    if (dto.type === 'FINALISATION') {
      if (dto.dryPaddyKg === undefined) {
        throw new BadRequestException('Une finalisation exige le poids de paddy sec obtenu');
      }
      // Une finalisation fait sortir du paddy brut. On ne peut pas déclarer sec
      // plus de paddy qu'il n'en reste de récolté sur le lot.
      if (dto.dryPaddyKg > lot.stockPaddyBrutKg) {
        throw new BadRequestException(
          `Paddy brut insuffisant : ${lot.stockPaddyBrutKg} kg restants sur le lot, ${dto.dryPaddyKg} kg déclarés secs`,
        );
      }
    }

    // Le numéro de vague est attribué par le serveur, pas par le client : deux
    // saisies concurrentes sur le même lot produiraient sinon deux « vague 3 ».
    const prochaineVague = lot.dryingWaves.length + 1;

    return this.prisma.$transaction(async (tx) => {
      const vague = await tx.paddyDryingWave.create({
        data: {
          processId,
          waveNumber: prochaineVague,
          type: dto.type,
          date: dto.date ? new Date(dto.date) : undefined,
          quantityOutKg: dto.quantityOutKg,
          quantityReturnedKg: dto.quantityReturnedKg,
          bags: dto.bags,
          dryPaddyKg: dto.dryPaddyKg,
          note: dto.note,
          userId,
        },
      });

      // Cumuls de lecture tenus à jour dans la même transaction que la vague :
      // ils ne peuvent donc jamais diverger de l'historique.
      await tx.paddyProcess.update({
        where: { id: processId },
        data: {
          waveNumber: prochaineVague,
          ...(dto.type === 'FINALISATION'
            ? { driedPaddyKg: { increment: dto.dryPaddyKg ?? 0 } }
            : {}),
        },
      });

      return vague;
    });
  }

  /**
   * Enregistre un décorticage : consomme du paddy sec, produit du riz, et fait
   * entrer ce riz en stock pour qu'il devienne vendable.
   */
  async addMilling(processId: string, dto: CreateMillingDto, userId: string, farmId: string) {
    const lot = await this.findOne(processId, farmId);

    if (dto.paddyUsedKg > lot.stockPaddySecKg) {
      throw new BadRequestException(
        `Paddy sec insuffisant : ${lot.stockPaddySecKg} kg disponibles, ${dto.paddyUsedKg} kg demandés`,
      );
    }
    // Décortiquer enlève la balle du grain : le riz pèse toujours moins que le
    // paddy engagé. L'inverse signale une inversion des deux champs à la saisie.
    if (dto.riceOutputKg > dto.paddyUsedKg) {
      throw new BadRequestException(
        'Le riz obtenu ne peut pas peser plus que le paddy engagé',
      );
    }

    // L'article destinataire est vérifié hors transaction : inutile d'ouvrir
    // une transaction pour découvrir ensuite que la cible n'existe pas.
    if (dto.riceStockItemId) {
      const article = await this.prisma.stockItem.findFirst({
        where: { id: dto.riceStockItemId, farmId },
      });
      if (!article) {
        throw new NotFoundException("Article de stock introuvable, ou il n'appartient pas à cette ferme");
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const decorticage = await tx.paddyMilling.create({
        data: {
          processId,
          date: dto.date ? new Date(dto.date) : undefined,
          paddyUsedKg: dto.paddyUsedKg,
          riceOutputKg: dto.riceOutputKg,
          riceStockItemId: dto.riceStockItemId,
          note: dto.note,
          userId,
        },
      });

      if (dto.riceStockItemId) {
        // Même écriture que StockService.registerMovement : un mouvement IN
        // pour la trace, et l'incrément du solde de l'article. On la refait ici
        // plutôt que d'appeler le service Stock, pour rester dans la même
        // transaction Prisma — sinon un échec de l'incrément laisserait un
        // décorticage enregistré sans riz en stock.
        await tx.stockMovement.create({
          data: {
            itemId: dto.riceStockItemId,
            type: 'IN',
            quantity: dto.riceOutputKg,
            reason: `Décorticage lot ${lot.lotNumber}`,
            userId,
          },
        });
        await tx.stockItem.update({
          where: { id: dto.riceStockItemId },
          data: { quantity: { increment: dto.riceOutputKg } },
        });
      }

      await tx.paddyProcess.update({
        where: { id: processId },
        data: { riceOutputKg: { increment: dto.riceOutputKg } },
      });

      return decorticage;
    });
  }

  /**
   * Clôture un lot.
   *
   * Un lot clôturé n'accepte plus de vague : c'est la seule façon de distinguer
   * « séchage encore en cours » de « lot terminé, reliquat assumé ». Le reliquat
   * de paddy brut n'est pas remis à zéro, il reste visible comme une perte.
   */
  async complete(id: string, farmId: string) {
    const lot = await this.findOne(id, farmId);
    if (lot.status === 'COMPLETED') {
      throw new BadRequestException('Ce lot est déjà clôturé');
    }
    return this.prisma.paddyProcess.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });
  }

  // TODO (Semaine 3, bloqué) — Vente du riz décortiqué.
  //
  // Le CDC 2.1.5 exige une vente avec numéro de reçu et option de retenue sur
  // salaire, soit la chaîne Client -> Invoice -> Payment -> SalaryDeduction.
  // Ces modèles existent au schéma mais n'ont ni module ni contrôleur, et le
  // module Transaction est en cours de développement par un autre membre de
  // l'équipe : rien n'est écrit ici pour ne pas entrer en conflit.
  //
  // Quand le module sera livré, la vente branchera sur ce qui existe déjà :
  // le riz est en stock via addMilling(), donc une vente est un mouvement OUT
  // sur l'article « Riz décortiqué » plus une facture. Aucune table paddy
  // supplémentaire ne devrait être nécessaire.
}
