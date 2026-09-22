import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CattleService } from './cattle.service';
import { CreateCattleDto } from './dto/create-cattle.dto';
import { UpdateCattleDto } from './dto/update-cattle.dto';
import { SellCattleDto } from './dto/sell-cattle.dto';
import { RecordDeathDto } from './dto/record-death.dto';
import { CreateMilkRecordDto } from './dto/create-milk-record.dto';
import { Query } from '@nestjs/common';
type AuthUser = { id: string; role: string; farmId: string };

@ApiTags('cattle')
@ApiBearerAuth()
@Controller('cattle')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CattleController {
  constructor(private service: CattleService) {}

  @Post()
  @Roles('ADMIN', 'OUVRIER') // saisie terrain autorisée, cohérent avec Production
  create(@Body() dto: CreateCattleDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user.farmId);
  }

  @Get()
  @Roles('ADMIN', 'OUVRIER', 'COMPTABLE', 'CONTROLEUR_INTERNE')
  findAll(@CurrentUser() user: AuthUser) {
    return this.service.findAll(user.farmId);
  }

  @Get(':id')
  @Roles('ADMIN', 'OUVRIER', 'COMPTABLE', 'CONTROLEUR_INTERNE')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.findOne(id, user.farmId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateCattleDto, @CurrentUser() user: AuthUser) {
    return this.service.update(id, dto, user.farmId);
  }

  @Post(':id/sell')
  @Roles('ADMIN') // vente = action financière, réservée au Gérant, cohérent avec Finance
  sell(@Param('id') id: string, @Body() dto: SellCattleDto, @CurrentUser() user: AuthUser) {
    return this.service.sell(id, dto, user.id, user.farmId);
  }

  @Post(':id/death')
  @Roles('ADMIN', 'OUVRIER') // constat de décès sur le terrain, pas forcément l'Admin en premier
  recordDeath(@Param('id') id: string, @Body() dto: RecordDeathDto, @CurrentUser() user: AuthUser) {
    return this.service.recordDeath(id, dto, user.farmId);
  }

  @Post(':id/milk-records')
  @Roles('ADMIN', 'OUVRIER') //saisie terrain
  recordMilk(
    @Param('id') id:string,
    @Body() dto: CreateMilkRecordDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.recordMilk(id, dto, user.id, user.farmId);
  }

  @Get(':id/milk-records')
  @Roles('ADMIN', 'OUVRIER', 'COMPTABLE', 'CONTROLEUR_INTERNE')
  getMilkRecords(@Param('id') id: string, @CurrentUser() user: AuthUser) {
  return this.service.getMilkRecords(id, user.farmId);
}

// Route au niveau du troupeau entier, pas d'un animal précis —
// placée avant ":id" dans les faits, mais comme elle a un chemin
// différent ("troupeau" n'est pas un UUID), pas de conflit de route.
  @Get('troupeau/lait')
  @Roles('ADMIN', 'OUVRIER', 'COMPTABLE', 'CONTROLEUR_INTERNE')
  getTroupeauMilk(
  @Query('dateDebut') dateDebut: string,
  @Query('dateFin') dateFin: string,
  @CurrentUser() user: AuthUser,
) {
  return this.service.getTroupeauMilkSummary(user.farmId, dateDebut, dateFin);
}
}