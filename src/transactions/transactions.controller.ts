import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @Roles('ADMIN', 'COMPTABLE') // saisie d'une operation, meme palier que Finance
  @ApiOperation({ summary: 'Créer une nouvelle transaction' })
  create(@Body() createTransactionDto: CreateTransactionDto, @CurrentUser() user: AuthUser) {
    return this.transactionsService.create(createTransactionDto, user.id, user.farmId);
  }

  @Get()
  @Roles('ADMIN', 'COMPTABLE', 'CONTROLEUR_INTERNE')
  @ApiOperation({ summary: 'Récupérer les transactions (filtrable par farmId)' })
  findAll(@Query('farmId') farmId?: string) {
    return this.transactionsService.findAll(farmId);
  }

  @Get('cash-flow')
  @Roles('ADMIN', 'COMPTABLE', 'CONTROLEUR_INTERNE')
  @ApiOperation({ summary: 'Solde recettes/dépenses pour une ferme' })
  getCashFlow(@Query('farmId') farmId: string) {
    return this.transactionsService.getCashFlow(farmId);
  }

  @Get(':id')
  @Roles('ADMIN', 'COMPTABLE', 'CONTROLEUR_INTERNE')
  @ApiOperation({ summary: 'Récupérer une transaction par son ID' })
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }
  

  @Patch(':id')
  @Roles('ADMIN', 'COMPTABLE')
  @ApiOperation({ summary: 'Mettre à jour une transaction' })
  update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this.transactionsService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  @Roles('ADMIN') // suppression comptable : gerant uniquement
  @ApiOperation({ summary: 'Supprimer une transaction' })
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(id);
  }
}