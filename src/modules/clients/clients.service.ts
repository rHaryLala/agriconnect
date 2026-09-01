import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { create } from 'domain';


@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(CreateClientDto: CreateClientDto) {
    return this.prisma.client.create({
      data: CreateClientDto,
    });
  }

  async findAll(farmId: string){
    return this.prisma.client.findMany({
      where: farmId? {farmId}: {},
      orderBy: { createdAt: 'desc'}, 
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({where: {id}, include: {invoices: true, 
      transaction: true},
    });

    if (!client){
      throw new NotFoundException(`Client avec ID ${id} introuvable`);
    }

    return client;
  }

}
