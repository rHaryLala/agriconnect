import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CurrentUser, AuthUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';


@ApiTags('Transactions')
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle transaction' })
  create(@Body() createTransactionDto: CreateTransactionDto, @CurrentUser() user: AuthUser) {
    return this.transactionsService.create(createTransactionDto, user.id, user.farmId);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer les transactions (filtrable par farmId)' })
  findAll(@Query('farmId') farmId?: string) {
    return this.transactionsService.findAll(farmId);
  }

  @Get('cash-flow')
  @ApiOperation({ summary: 'Solde recettes/dépenses pour une ferme' })
  getCashFlow(@Query('farmId') farmId: string) {
    return this.transactionsService.getCashFlow(farmId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une transaction par son ID' })
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }
  

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une transaction' })
  update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this.transactionsService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une transaction' })
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(id);
  }
}