import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  
  async create(createTransactionDto: CreateTransactionDto, userId: string, farmId: string) {
    const { clientId, invoiceId, ...data } = createTransactionDto;

    return this.prisma.transaction.create({
      data: {
        ...data,
        farm: { connect: { id: farmId } },
        user: { connect: { id: userId } },
        ...(clientId && { client: { connect: { id: clientId } } }),
        ...(invoiceId && { invoice: { connect: { id: invoiceId } } }),
      },
    });
  }

  async findAll(farmId?: string) {
    return this.prisma.transaction.findMany({
      where: farmId ? { farmId } : {},
      include: { client: true, invoice: true, user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: { client: true, invoice: true, farm: true },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction avec l'id ${id} introuvable`);
    }

    return transaction;
  }

  async getCashFlow(farmId: string) {
    const aggregates = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: { farmId },
      _sum: { amount: true },
    });

    const recettes = aggregates.find((a) => a.type === 'RECETTE')?._sum.amount?.toNumber() ?? 0;
    const depenses = aggregates.find((a) => a.type === 'DEPENSE')?._sum.amount?.toNumber() ?? 0;

    return {
      recettes,
      depenses,
      balance: recettes - depenses,
    };
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto) {
    await this.findOne(id);

    const { clientId, invoiceId, date, ...data } = updateTransactionDto;

    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...data,
        ...(date && { date: new Date(date) }),
        ...(clientId && { client: { connect: { id: clientId } } }),
        ...(invoiceId && { invoice: { connect: { id: invoiceId } } }),
      },
      include: {
        client: true,
        invoice: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.transaction.delete({
      where: { id },
    });
  }
}