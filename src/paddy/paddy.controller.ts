import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaddyService } from './paddy.service';
import { CreatePaddyProcessDto } from './dto/create-paddy-process.dto';
import { CreateDryingWaveDto } from './dto/create-drying-wave.dto';
import { CreateMillingDto } from './dto/create-milling.dto';

type AuthUser = { id: string; role: string; farmId: string };

/**
 * Stack : contrôleur NestJS monté sur /api/v1/paddy (le préfixe global est posé
 * dans main.ts). Il ne contient aucun calcul : il extrait l'utilisateur du JWT,
 * passe le DTO déjà validé au service, et renvoie le résultat.
 *
 * Métier : les routes suivent le parcours physique du grain, une route par
 * étape réelle — récolte, séchage, décorticage, clôture. Elles sont imbriquées
 * sous :id parce qu'aucune de ces étapes n'a de sens hors d'un lot.
 */
@ApiTags('paddy')
@ApiBearerAuth()
@Controller('paddy')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaddyController {
  constructor(private service: PaddyService) {}

  // Ouvrir un lot = déclarer une récolte. Saisie de terrain, donc ouverte à
  // l'ouvrier, comme la création de production.
  @Post()
  @Roles('ADMIN', 'OUVRIER')
  create(@Body() dto: CreatePaddyProcessDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user.id, user.farmId);
  }

  // Lecture large : le comptable et le contrôleur interne ont besoin des
  // quantités pour leurs rapports, sans pouvoir rien saisir.
  @Get()
  @Roles('ADMIN', 'OUVRIER', 'COMPTABLE', 'MAGASINIER', 'CONTROLEUR_INTERNE')
  findAll(@Query('status') status: string, @CurrentUser() user: AuthUser) {
    return this.service.findAll(user.farmId, status);
  }

  @Get(':id')
  @Roles('ADMIN', 'OUVRIER', 'COMPTABLE', 'MAGASINIER', 'CONTROLEUR_INTERNE')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.findOne(id, user.farmId);
  }

  // Le séchage est une opération quotidienne du magasin : magasinier inclus.
  @Post(':id/drying-waves')
  @Roles('ADMIN', 'OUVRIER', 'MAGASINIER')
  addDryingWave(
    @Param('id') id: string,
    @Body() dto: CreateDryingWaveDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.addDryingWave(id, dto, user.id, user.farmId);
  }

  // Le décorticage écrit dans le stock (mouvement d'entrée sur l'article riz) :
  // réservé à ceux qui ont déjà le droit d'écrire en stock.
  @Post(':id/millings')
  @Roles('ADMIN', 'MAGASINIER')
  addMilling(
    @Param('id') id: string,
    @Body() dto: CreateMillingDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.addMilling(id, dto, user.id, user.farmId);
  }

  // Clôturer un lot acte un reliquat éventuel comme une perte : décision de
  // gestion, donc réservée au gérant.
  @Patch(':id/complete')
  @Roles('ADMIN')
  complete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.complete(id, user.farmId);
  }

  // TODO (Semaine 3, bloqué) — POST :id/sales.
  // La vente riz exige un numéro de reçu et l'option de retenue sur salaire,
  // c'est-à-dire le module Transaction (Invoice / Payment / SalaryDeduction),
  // en cours de développement côté collègue. Route volontairement non écrite
  // pour éviter un conflit sur ce module.
}
