import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { connect } from 'http2';

@Injectable()
export class TransactionsService {
  constructor (private readonly prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const {farmId, clientId, categoryId, ...data} = createTransactionDto;

    return this.prisma.transaction.create({data: {
      ...data, farm: { connect: {id: farmId } }, 
      ...(clientId && {client: {connect: {id: clientId } } } ), 
      ...(categoryId && {category: {connect: {id: categoryId } } } ),
    }
    })
  }

  async findAll(farmId?: string ){
    return this.prisma.transaction.findMany({
      where: farmId? { farmId } : {}, include: { client:true, category: true,}, 
      orderBy: {createdAt: 'desc'},
    });

  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id }, include: {client: true, category: true, farm: true,}, 
    });

    if(!transaction) {
      throw new NotFoundException(`Transanction avec l'id ${id} introuvable`)
    }

    return transaction;
  }

  async update (id: string, updateTransactionDto: UpdateTransactionDto){
    await this.findOne(id);

    const {farmId, clientId, categoryId, ...data } = updateTransactionDto;

    return this.prisma.transaction.update({
      where: {id},
      data: {
        ...data, ...(farmId && {farm: {connect: {id: farmId } } } ),
        ...(clientId && {client: {connect: {id: clientId } } } ),
        ...(categoryId && {category: {connect: {id: categoryId } } } ),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.transaction.delete ({
      where: {id},
    });
  }
}
