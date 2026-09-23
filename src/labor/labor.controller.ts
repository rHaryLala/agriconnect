import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LaborService } from './labor.service';
import { CreateLaborActivityDto } from './dto/create-labor-activity.dto';
import { CreateLaborLogDto } from './dto/create-labor-log.dto';

type AuthUser = { id: string; role: string; farmId: string };

/**
 * Stack : contrôleur NestJS monté sur /api/v1/labor.
 *
 * Les routes du référentiel sont préfixées 'activities' et les relevés 'logs'.
 * Cette séparation explicite évite le piège rencontré ailleurs dans le projet :
 * un @Get(':id') à la racine du contrôleur aurait intercepté /labor/activities
 * avant que la route dédiée ne soit atteinte, Nest résolvant dans l'ordre de
 * déclaration.
 */
@ApiTags('labor')
@ApiBearerAuth()
@Controller('labor')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LaborController {
  constructor(private service: LaborService) {}

  // --- référentiel d'activités -------------------------------------------
  // Configurer la liste engage tous les relevés à venir : réservé au gérant.

  @Post('activities')
  @Roles('ADMIN')
  createActivity(@Body() dto: CreateLaborActivityDto, @CurrentUser() user: AuthUser) {
    return this.service.createActivity(dto, user.farmId);
  }

  @Get('activities')
  @Roles('ADMIN', 'OUVRIER', 'COMPTABLE', 'MAGASINIER', 'CONTROLEUR_INTERNE')
  findAllActivities(@CurrentUser() user: AuthUser) {
    return this.service.findAllActivities(user.farmId);
  }

  @Patch('activities/:id')
  @Roles('ADMIN')
  updateActivity(
    @Param('id') id: string,
    @Body() dto: CreateLaborActivityDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.updateActivity(id, dto, user.farmId);
  }

  @Delete('activities/:id')
  @Roles('ADMIN')
  removeActivity(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.removeActivity(id, user.farmId);
  }

  // --- relevés journaliers ------------------------------------------------
  // Saisie de terrain quotidienne : l'ouvrier doit pouvoir la faire lui-même.

  @Post('logs')
  @Roles('ADMIN', 'OUVRIER')
  createLog(@Body() dto: CreateLaborLogDto, @CurrentUser() user: AuthUser) {
    return this.service.createLog(dto, user.id, user.farmId);
  }

  @Get('logs')
  @Roles('ADMIN', 'OUVRIER', 'COMPTABLE', 'MAGASINIER', 'CONTROLEUR_INTERNE')
  findAllLogs(
    @Query('start') start: string,
    @Query('end') end: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.findAllLogs(user.farmId, start, end);
  }

  @Patch('logs/:id')
  @Roles('ADMIN', 'OUVRIER')
  updateLog(
    @Param('id') id: string,
    @Body() dto: CreateLaborLogDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.updateLog(id, dto, user.farmId);
  }

  // Effacer un relevé réécrit l'historique de la période : gérant uniquement.
  @Delete('logs/:id')
  @Roles('ADMIN')
  removeLog(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.removeLog(id, user.farmId);
  }

  // --- synthèse -----------------------------------------------------------
  // Jours-homme par activité sur une période. Alimente l'écran main d'œuvre du
  // front, et servira au rapport consolidé de la Semaine 4.
  @Get('summary')
  @Roles('ADMIN', 'COMPTABLE', 'CONTROLEUR_INTERNE')
  resume(
    @Query('start') start: string,
    @Query('end') end: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.resume(user.farmId, start, end);
  }
}
