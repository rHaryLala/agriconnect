import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PoultryService } from './poultry.service';
import { CreatePoultryDto } from './dto/create-poultry.dto';
import { UpdatePoultryDto } from './dto/update-poultry.dto';
import { SellPoultryDto } from './dto/sell-poultry.dto';
import { RecordExitDto } from './dto/record-exit.dto';
import { CreateWeeklyRecordDto } from './dto/create-weekly-record.dto';

type AuthUser = { id: string; role: string; farmId: string };

@ApiTags('poultry')
@ApiBearerAuth()
@Controller('poultry')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PoultryController {
  constructor(private service: PoultryService) {}

  @Post()
  @Roles('ADMIN', 'OUVRIER')
  create(@Body() dto: CreatePoultryDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user.id, user.farmId);
  }

  @Get()
  @Roles('ADMIN', 'OUVRIER', 'COMPTABLE', 'CONTROLEUR_INTERNE')
  findAll(@Query('type') type: string, @CurrentUser() user: AuthUser) {
    return this.service.findAll(user.farmId, type);
  }

  @Get(':id')
  @Roles('ADMIN', 'OUVRIER', 'COMPTABLE', 'CONTROLEUR_INTERNE')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.findOne(id, user.farmId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdatePoultryDto, @CurrentUser() user: AuthUser) {
    return this.service.update(id, dto, user.farmId);
  }

  @Post(':id/sell')
  @Roles('ADMIN')
  sell(@Param('id') id: string, @Body() dto: SellPoultryDto, @CurrentUser() user: AuthUser) {
    return this.service.sell(id, dto, user.id, user.farmId);
  }

  @Post(':id/exit')
  @Roles('ADMIN', 'OUVRIER')
  recordExit(@Param('id') id: string, @Body() dto: RecordExitDto, @CurrentUser() user: AuthUser) {
    return this.service.recordExit(id, dto, user.farmId);
  }

  @Post(':id/weekly-records')
    @Roles('ADMIN', 'OUVRIER') // saisie terrain hebdomadaire, cohérent avec Production
    addWeeklyRecord(
    @Param('id') id: string,
    @Body() dto: CreateWeeklyRecordDto,
    @CurrentUser() user: AuthUser,
) {
  return this.service.addWeeklyRecord(id, dto, user.farmId);
}

@Get(':id/weekly-records')
@Roles('ADMIN', 'OUVRIER', 'COMPTABLE', 'CONTROLEUR_INTERNE')
getWeeklyRecords(@Param('id') id: string, @CurrentUser() user: AuthUser) {
  return this.service.getWeeklyRecords(id, user.farmId);
}
}