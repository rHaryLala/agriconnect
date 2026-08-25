import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { CorrectMovementDto } from './dto/correct-movement.dto';
import { FilterHistoriqueDto } from './dto/filter-historique.dto';

type AuthUser = { id: string; role: string; farmId: string };

@ApiTags('stock')
@ApiBearerAuth()
@Controller('stock')
@UseGuards(JwtAuthGuard, RolesGuard) // authentification obligatoire partout dans ce contrôleur
export class StockController {
  constructor(private stockService: StockService) {}

  // ---------- Catalogue des articles ----------

  @Post('items')
  @Roles('ADMIN') // créer un NOUVEL article de stock = action de configuration, pas de saisie quotidienne
  createItem(@Body() dto: CreateStockDto, @CurrentUser() user: AuthUser) {
    return this.stockService.createItem(dto, user.farmId);
  }

  @Get('items')
  @Roles('ADMIN', 'OUVRIER', 'COMPTABLE') // lecture ouverte aux trois rôles
  findAllItems(@CurrentUser() user: AuthUser) {
    return this.stockService.findAllItems(user.farmId);
  }

  @Get('items/:id')
  @Roles('ADMIN', 'OUVRIER', 'COMPTABLE')
  findOneItem(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.stockService.findOneItem(id, user.farmId);
  }

  @Patch('items/:id')
  @Roles('ADMIN') // modifier les infos d'un article (nom, catégorie, seuil) : matrice Sprint 1, Comptable n'a pas "M" sur Stock
  updateItem(@Param('id') id: string, @Body() dto: UpdateStockDto, @CurrentUser() user: AuthUser) {
    return this.stockService.updateItem(id, dto, user.farmId);
  }

  // ---------- Mouvements ----------

  @Post('items/:itemId/movements')
  @Roles('ADMIN', 'OUVRIER')
  registerMovement(
    @Param('itemId') itemId: string,
    @Body() dto: CreateStockMovementDto,
    @CurrentUser() user: AuthUser,
  ) {
    // RG-03 : la régularisation reste réservée au Gérant, même si un OUVRIER
    // peut créer des mouvements IN/OUT normaux — vérifié ici, pas seulement
    // fait confiance au front (cf. étape "autorisation toujours côté serveur")
    if (dto.type === 'AJUSTEMENT' && user.role !== 'ADMIN') {
      throw new BadRequestException('Seul le Gérant peut effectuer un ajustement de stock');
    }
    return this.stockService.registerMovement(itemId, dto, user.id, user.farmId);
  }

  @Post('movements/:movementId/correction')
  @Roles('ADMIN', 'COMPTABLE') // matrice Sprint 1 : les deux ont le droit "X" (corriger) sur Stock
  correctMovement(
    @Param('movementId') movementId: string,
    @Body() dto: CorrectMovementDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.stockService.correctMovement(movementId, dto.reason, user.id, user.farmId);
  }

  // ---------- Lecture agrégée ----------

  @Get('historique')
  @Roles('ADMIN', 'OUVRIER', 'COMPTABLE')
  historique(@Query() filters: FilterHistoriqueDto, @CurrentUser() user: AuthUser) {
    return this.stockService.historique(user.farmId, filters);
  }

  @Get('alertes')
  @Roles('ADMIN', 'COMPTABLE') // cohérent avec la matrice : Employé de terrain exclu des rapports
  alertes(@CurrentUser() user: AuthUser) {
    return this.stockService.alertes(user.farmId);
  }
}