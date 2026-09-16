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

  async getCashFlow(farmId: string) {
    const aggregates = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: { farmId },
      _sum: { amount: true },
    });

    const recettes = aggregates.find((a) => a.type === 'RECETTE')?._sum.amount || 0;
    const depenses = aggregates.find((a) => a.type === 'DEPENSE')?._sum.amount || 0;

    return {
      recettes,
      depenses,
      balance: recettes - depenses, // Solde net de la caisse
    };
  }

  async update (id: string, updateTransactionDto: UpdateTransactionDto){
    await this.findOne(id);

    const {farmId, clientId, userId, invoiceId, date, ...data } = updateTransactionDto;

    return this.prisma.transaction.update({
      where: {id},
      data: {
        ...data,
        ...(date && { date: new Date(date) }),
        ...(farmId && { farm: { connect: { id: farmId } } }),
        ...(userId && { user: { connect: { id: userId } } }),
        ...(clientId && { client: { connect: { id: clientId } } }),
        ...(invoiceId && { invoice: { connect: { id: invoiceId } } }),
      },
      include: {
        client: true,
        invoice: true,
      }
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.transaction.delete ({
      where: {id},
    });
  }
}
