import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLaborActivityDto } from './dto/create-labor-activity.dto';
import { CreateLaborLogDto } from './dto/create-labor-log.dto';

/**
 * Stack : service NestJS, unique interlocuteur de Prisma pour ce module.
 *
 * Métier : journal de main d'œuvre journalière (CDC 2.1.4). Deux objets
 * distincts et volontairement séparés :
 *  - l'activité, référentiel stable que la ferme configure une fois ;
 *  - le relevé quotidien, qui s'y rattache.
 * Le front (mainOeuvreCalc.ts) en tire des jours-homme par période, c'est ce que
 * reproduit `resume()` plus bas.
 */
@Injectable()
export class LaborService {
  constructor(private prisma: PrismaService) {}

  // ---------------------------------------------------------------- activités

  async createActivity(dto: CreateLaborActivityDto, farmId: string) {
    // On normalise avant de comparer : « Mijinja » et « mijinja  » sont la même
    // activité pour un chef d'équipe, et deux lignes distinctes casseraient tous
    // les totaux par activité.
    const name = dto.name.trim();

    const existante = await this.prisma.laborActivity.findFirst({
      where: { farmId, name: { equals: name, mode: 'insensitive' } },
    });
    if (existante) {
      throw new ConflictException(`L'activité « ${name} » existe déjà sur cette ferme`);
    }

    return this.prisma.laborActivity.create({ data: { name, farmId } });
  }

  findAllActivities(farmId: string) {
    return this.prisma.laborActivity.findMany({
      where: { farmId },
      orderBy: { name: 'asc' },
    });
  }

  async updateActivity(id: string, dto: CreateLaborActivityDto, farmId: string) {
    await this.getActivityOrFail(id, farmId);
    const name = dto.name.trim();

    const doublon = await this.prisma.laborActivity.findFirst({
      where: { farmId, name: { equals: name, mode: 'insensitive' }, NOT: { id } },
    });
    if (doublon) {
      throw new ConflictException(`L'activité « ${name} » existe déjà sur cette ferme`);
    }

    // Renommer, pas recréer : les relevés déjà saisis suivent le nouveau libellé
    // puisqu'ils pointent sur l'identifiant. C'est exactement le cas d'usage qui
    // justifie une table plutôt qu'un enum — corriger une orthographe malgache
    // sans migration ni perte d'historique.
    return this.prisma.laborActivity.update({ where: { id }, data: { name } });
  }

  async removeActivity(id: string, farmId: string) {
    await this.getActivityOrFail(id, farmId);

    // La contrainte onDelete: Restrict le refuserait de toute façon, mais au
    // prix d'une erreur SQL illisible. On explique plutôt pourquoi.
    const utilisations = await this.prisma.laborLog.count({ where: { activityId: id } });
    if (utilisations > 0) {
      throw new BadRequestException(
        `Cette activité est utilisée par ${utilisations} relevé(s) : la renommer, ou supprimer d'abord les relevés`,
      );
    }

    return this.prisma.laborActivity.delete({ where: { id } });
  }

  private async getActivityOrFail(id: string, farmId: string) {
    const activite = await this.prisma.laborActivity.findFirst({ where: { id, farmId } });
    if (!activite) {
      throw new NotFoundException('Activité introuvable');
    }
    return activite;
  }

  // ------------------------------------------------------------- relevés jour

  async createLog(dto: CreateLaborLogDto, userId: string, farmId: string) {
    // On vérifie que l'activité appartient bien à la ferme de l'appelant :
    // sans ce contrôle, un identifiant deviné rattacherait le relevé à
    // l'activité d'une autre ferme.
    await this.getActivityOrFail(dto.activityId, farmId);

    return this.prisma.laborLog.create({
      data: {
        activityId: dto.activityId,
        workerCount: dto.workerCount,
        date: dto.date ? new Date(dto.date) : undefined,
        note: dto.note,
        userId,
        farmId,
      },
      include: { activity: true },
    });
  }

  findAllLogs(farmId: string, start?: string, end?: string) {
    return this.prisma.laborLog.findMany({
      where: { farmId, ...this.filtrePeriode(start, end) },
      include: { activity: true },
      orderBy: { date: 'desc' },
    });
  }

  async updateLog(id: string, dto: CreateLaborLogDto, farmId: string) {
    await this.getLogOrFail(id, farmId);
    await this.getActivityOrFail(dto.activityId, farmId);

    return this.prisma.laborLog.update({
      where: { id },
      data: {
        activityId: dto.activityId,
        workerCount: dto.workerCount,
        date: dto.date ? new Date(dto.date) : undefined,
        note: dto.note,
      },
      include: { activity: true },
    });
  }

  async removeLog(id: string, farmId: string) {
    await this.getLogOrFail(id, farmId);
    // Suppression physique assumée ici, contrairement aux mouvements de stock :
    // un relevé de main d'œuvre n'a aucune contrepartie comptable, rien ne se
    // déséquilibre si on l'efface.
    return this.prisma.laborLog.delete({ where: { id } });
  }

  private async getLogOrFail(id: string, farmId: string) {
    const releve = await this.prisma.laborLog.findFirst({ where: { id, farmId } });
    if (!releve) {
      throw new NotFoundException('Relevé de main d\'œuvre introuvable');
    }
    return releve;
  }

  /**
   * Bornes de période, inclusives des deux côtés.
   *
   * `end` est poussée à la fin de la journée : une date ISO nue vaut minuit, et
   * sans ce décalage le dernier jour demandé serait systématiquement exclu.
   */
  private filtrePeriode(start?: string, end?: string) {
    if (!start && !end) return {};
    const borneFin = end ? new Date(end) : undefined;
    if (borneFin) borneFin.setHours(23, 59, 59, 999);
    return {
      date: {
        ...(start ? { gte: new Date(start) } : {}),
        ...(borneFin ? { lte: borneFin } : {}),
      },
    };
  }

  /**
   * Totaux sur une période — équivalent backend de mainOeuvreCalc.ts.
   *
   * Métier : l'unité utile est le jour-homme, c'est-à-dire la somme des
   * effectifs et non le nombre de lignes. Dix personnes un jour et une personne
   * dix jours coûtent la même chose à la ferme, et c'est ce que ce total
   * exprime.
   */
  async resume(farmId: string, start?: string, end?: string) {
    const releves = await this.prisma.laborLog.findMany({
      where: { farmId, ...this.filtrePeriode(start, end) },
      include: { activity: true },
    });

    const parActivite = new Map<string, { activite: string; joursHomme: number; jours: number }>();
    for (const releve of releves) {
      const ligne = parActivite.get(releve.activityId) ?? {
        activite: releve.activity.name,
        joursHomme: 0,
        jours: 0,
      };
      ligne.joursHomme += releve.workerCount;
      ligne.jours += 1;
      parActivite.set(releve.activityId, ligne);
    }

    const totalJoursHomme = releves.reduce((total, r) => total + r.workerCount, 0);

    // Le dénominateur est le nombre de journées DISTINCTES saisies, pas le
    // nombre de lignes : une même journée porte souvent plusieurs activités, et
    // compter les lignes écraserait la moyenne d'autant.
    const journeesDistinctes = new Set(
      releves.map((r) => r.date.toISOString().slice(0, 10)),
    ).size;

    return {
      totalJoursHomme,
      journeesSaisies: journeesDistinctes,
      moyenneEffectifParJour: journeesDistinctes === 0 ? 0 : totalJoursHomme / journeesDistinctes,
      parActivite: [...parActivite.values()].sort((a, b) => b.joursHomme - a.joursHomme),
    };
  }
}
