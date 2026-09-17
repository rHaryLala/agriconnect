import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePoultryDto } from './dto/create-poultry.dto';
import { UpdatePoultryDto } from './dto/update-poultry.dto';
import { SellPoultryDto } from './dto/sell-poultry.dto';
import { RecordExitDto } from './dto/record-exit.dto';
import { CreateWeeklyRecordDto } from './dto/create-weekly-record.dto';

@Injectable()
export class PoultryService {
  constructor(private prisma: PrismaService) {}

  // Calcule l'âge réel à aujourd'hui : âge au moment de la création +
  // nombre de semaines écoulées depuis. Jamais stocké tel quel, donc
  // jamais périmé — évite d'avoir à se souvenir d'incrémenter un compteur.
  private calculerAgeActuel(initialAge: number, entryDate: Date): number {
    const semainesEcoulees = Math.floor(
      (Date.now() - entryDate.getTime()) / (1000 * 60 * 60 * 24 * 7),
    );
    return initialAge + semainesEcoulees;
  }

  async create(dto: CreatePoultryDto, userId: string, farmId: string) {
    return this.prisma.poultryTracking.create({
      data: {
        tagOrNumber: dto.tagOrNumber,
        type: dto.type,
        initialAge: dto.initialAge ?? 0,
        notes: dto.notes,
        userId,
        farmId,
      },
    });
  }

  async findAll(farmId: string, type?: string) {
    const items = await this.prisma.poultryTracking.findMany({
      where: { farmId, type: type as never },
      orderBy: { entryDate: 'desc' },
    });
    // On enrichit chaque ligne avec l'âge actuel calculé, sans jamais
    // le stocker — voir calculerAgeActuel ci-dessus.
    return items.map((item) => ({
      ...item,
      ageActuelEnSemaines: this.calculerAgeActuel(item.initialAge, item.entryDate),
    }));
  }

  async findOne(id: string, farmId: string) {
    const poultry = await this.prisma.poultryTracking.findFirst({
      where: { id, farmId },
      include: { weeklyRecords: { orderBy: { weekNumber: 'asc' } } },
    });
    if (!poultry) {
      throw new NotFoundException('Volaille introuvable');
    }
    return {
      ...poultry,
      ageActuelEnSemaines: this.calculerAgeActuel(poultry.initialAge, poultry.entryDate),
    };
  }

  async update(id: string, dto: UpdatePoultryDto, farmId: string) {
    await this.findOne(id, farmId);
    return this.prisma.poultryTracking.update({ where: { id }, data: dto });
  }

  async sell(id: string, dto: SellPoultryDto, userId: string, farmId: string) {
    const poultry = await this.findOne(id, farmId);
    if (poultry.status !== 'EN_ELEVAGE') {
      throw new BadRequestException(`Cette volaille est déjà ${poultry.status}`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.poultryTracking.update({
        where: { id },
        data: { status: 'VENDU', exitDate: new Date(), salePrice: dto.salePrice },
      });

      await tx.transaction.create({
        data: {
          type: 'RECETTE',
          amount: dto.salePrice,
          reference: `Vente volaille ${poultry.tagOrNumber ?? poultry.id}`,
          notes: `Vente ${poultry.type}`,
          userId,
          farmId,
        },
      });

      return updated;
    });
  }

  async recordExit(id: string, dto: RecordExitDto, farmId: string) {
    const poultry = await this.findOne(id, farmId);
    if (poultry.status !== 'EN_ELEVAGE') {
      throw new BadRequestException(`Cette volaille est déjà ${poultry.status}`);
    }

    return this.prisma.poultryTracking.update({
      where: { id },
      data: { status: dto.status, exitDate: new Date(), exitReason: dto.exitReason },
    });
  }

  // --- Suivi hebdomadaire ---

  async addWeeklyRecord(poultryTrackingId: string, dto: CreateWeeklyRecordDto, farmId: string) {
    // Vérifie que l'animal/lot existe bien et appartient à la ferme
    await this.findOne(poultryTrackingId, farmId);

    return this.prisma.poultryWeeklyRecord.create({
      data: {
        poultryTrackingId,
        weekNumber: dto.weekNumber,
        weightKg: dto.weightKg,
        ponteRate: dto.ponteRate,
        mortalityCount: dto.mortalityCount ?? 0,
        vaccineName: dto.vaccineName,
        vaccineDate: dto.vaccineDate ? new Date(dto.vaccineDate) : undefined,
        notes: dto.notes,
      },
    });
  }

  async getWeeklyRecords(poultryTrackingId: string, farmId: string) {
    await this.findOne(poultryTrackingId, farmId);
    return this.prisma.poultryWeeklyRecord.findMany({
      where: { poultryTrackingId },
      orderBy: { weekNumber: 'asc' },
    });
  }
}