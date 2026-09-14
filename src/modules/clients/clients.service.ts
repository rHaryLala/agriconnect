import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ClientType } from '@prisma/client';


@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto) {
    const {type, matriculeuaz } = createClientDto;
    //regle metier: pour les personnels de l'UAZ le matricule obligatoire
    if (type === ClientType.PERSONNEL_UAZ && (!matriculeuaz || matriculeuaz.trim() === '')){
      throw new BadRequestException("Le matricule est obligatoire pour le personnel UAZ");
    }

    return this.prisma.client.create({

      data: {...createClientDto,
        //si c'est pas personnel de l'UAZ=null
        matriculeuaz: type === ClientType.PERSONNEL_UAZ ? matriculeuaz : null,
      },
    });
  }

  async findAll(farmId?: string){
    return this.prisma.client.findMany({
      where: farmId? {farmId}: {},
      orderBy: { createdAt: 'desc'}, 
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({where: {id}, include: {invoices: {orderBy: {createdAt: 'desc'},}, 
      transactions: {orderBy: {createdAt: 'desc'},},
    }});

    if (!client){
      throw new NotFoundException(`Client avec ID ${id} introuvable`);
    }

    return client;  
  }

  async update(id: string, updateClientDto: UpdateClientDto){
    await this.findOne(id);

    return this.prisma.client.update({where: {id}, data: updateClientDto });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.client.delete({
      where: {id}, 
    });
  }

}
