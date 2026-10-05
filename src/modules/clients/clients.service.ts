import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ClientType } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto) {
    const { type, matriculeuaz } = createClientDto;
    // règle métier : pour les personnels de l'UAZ le matricule est obligatoire
    if (type === ClientType.PERSONNEL_UAZ && (!matriculeuaz || matriculeuaz.trim() === '')) {
      throw new BadRequestException("Le matricule est obligatoire pour le personnel UAZ");
    }

    return this.prisma.client.create({
      data: {
        ...createClientDto,
        matriculeuaz: type === ClientType.PERSONNEL_UAZ ? matriculeuaz : null,
      },
    });
  }

  async findAll(farmId?: string) {
    return this.prisma.client.findMany({
      where: farmId ? { farmId } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        invoices: { orderBy: { createdAt: 'desc' } },
        transactions: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!client) {
      throw new NotFoundException(`Client avec ID ${id} introuvable`);
    }

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    const existing = await this.findOne(id);
    const finalType = updateClientDto.type ?? existing.type;
    const finalMatricule =
      updateClientDto.matriculeuaz !== undefined
        ? updateClientDto.matriculeuaz
        : existing.matriculeuaz;

    if (finalType === ClientType.PERSONNEL_UAZ && (!finalMatricule || finalMatricule.trim() === '')) {
      throw new BadRequestException("Le matricule est obligatoire pour le personnel UAZ");
    }

    return this.prisma.client.update({
      where: { id },
      data: {
        ...updateClientDto,
        matriculeuaz: finalType === ClientType.PERSONNEL_UAZ ? finalMatricule : null,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.client.delete({
      where: { id },
    });
  }
}