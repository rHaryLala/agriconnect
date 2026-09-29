import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { StockTransferService } from './stock-transfer.service';
import { CreateTransferDto } from './dto/create-transfer.dto';

type AuthUser = { id: string; role: string; farmId: string };

@ApiTags('stock-transfer')
@ApiBearerAuth()
@Controller('stock-transfer')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockTransferController {
  constructor(private service: StockTransferService) {}

  @Post()
  @Roles('ADMIN', 'MAGASINIER') // celui qui envoie depuis la Ferme ou le Magasinier
  create(@Body() dto: CreateTransferDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user.id, user.farmId);
  }

  @Post(':id/confirm')
  @Roles('ADMIN', 'MAGASINIER') // celui qui réceptionne à l'autre bout
  confirm(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.confirm(id, user.id, user.farmId);
  }

  @Get()
  @Roles('ADMIN', 'MAGASINIER', 'COMPTABLE', 'CONTROLEUR_INTERNE') // lecture large, cohérent avec son rôle de validation
  findAll(@CurrentUser() user: AuthUser) {
    return this.service.findAll(user.farmId);
  }
}