import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle transaction' })
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer les transactions (filtrable par farmId)' })
  findAll(@Query('farmId') farmId?: string) {
    return this.transactionsService.findAll(farmId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une transaction par son ID' })
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id); // On a retiré le +
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une transaction' })
  update(
    @Param('id') id: string, 
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(id, updateTransactionDto); // On a retiré le +
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une transaction' })
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(id); // On a retiré le +
  }
}