import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor (private readonly prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const {farmId, clientId, userId, invoiceId, ...data} = createTransactionDto;

    return this.prisma.transaction.create({data: {
      ...data, farm: { connect: {id: farmId } }, 
      user: { connect: { id: userId } },
      ...(clientId && {client: {connect: {id: clientId } } } ), 
      ...(invoiceId && {invoice: {connect: {id: invoiceId } } } ),
    }
    })
  }

  async findAll(farmId?: string ){
    return this.prisma.transaction.findMany({
      where: farmId? { farmId } : {}, include: { client:true, invoice: true, user: true}, 
      orderBy: {createdAt: 'desc'},
    });

  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id }, include: {client: true, invoice: true, farm: true,}, 
    });

    if(!transaction) {
      throw new NotFoundException(`Transanction avec l'id ${id} introuvable`)
    }

    return transaction;
  }

  async update (id: string, updateTransactionDto: UpdateTransactionDto){
    await this.findOne(id);

    const {farmId, clientId, userId, invoiceId, ...data } = updateTransactionDto;

    return this.prisma.transaction.update({
      where: {id},
      data: {
        ...data, ...(farmId && {farm: {connect: {id: farmId } } } ),
        ...(userId && { user: { connect: { id: userId } } }),
        ...(clientId && {client: {connect: {id: clientId } } } ),
        ...(invoiceId && {invoice: {connect: {id: invoiceId } } } ),
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
