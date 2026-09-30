import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { CreateSupplierPaymentDto } from './dto/create-supplier-payment.dto';

type AuthUser = { id: string; role: string; farmId: string };

@ApiTags('suppliers')
@ApiBearerAuth()
@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupplierController {
  constructor(private service: SupplierService) {}

  @Post()
  @Roles('ADMIN') // création d'un fournisseur = configuration, cohérent avec StockItem
  create(@Body() dto: CreateSupplierDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user.farmId);
  }

  @Get()
  @Roles('ADMIN', 'COMPTABLE', 'CONTROLEUR_INTERNE')
  findAll(@CurrentUser() user: AuthUser) {
    return this.service.findAll(user.farmId);
  }

  @Get(':id')
  @Roles('ADMIN', 'COMPTABLE', 'CONTROLEUR_INTERNE')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.findOneWithSummary(id, user.farmId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateSupplierDto, @CurrentUser() user: AuthUser) {
    return this.service.update(id, dto, user.farmId);
  }

  @Post(':id/purchases')
  @Roles('ADMIN', 'COMPTABLE') // saisie d'un achat, cohérent avec la matrice Finance
  createPurchase(
    @Param('id') supplierId: string,
    @Body() dto: CreatePurchaseDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.createPurchase(supplierId, dto, user.farmId);
  }

  @Get(':id/purchases')
  @Roles('ADMIN', 'COMPTABLE', 'CONTROLEUR_INTERNE')
  findPurchases(@Param('id') supplierId: string, @CurrentUser() user: AuthUser) {
    return this.service.findPurchases(supplierId, user.farmId);
  }

  @Post('purchases/:purchaseId/payments')
  @Roles('ADMIN', 'COMPTABLE')
  recordPayment(
    @Param('purchaseId') purchaseId: string,
    @Body() dto: CreateSupplierPaymentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.recordPayment(purchaseId, dto, user.farmId, user.id);
  }

  @Get('purchases/:purchaseId/payments')
  @Roles('ADMIN', 'COMPTABLE', 'CONTROLEUR_INTERNE')
  findPayments(@Param('purchaseId') purchaseId: string, @CurrentUser() user: AuthUser) {
    return this.service.findPayments(purchaseId, user.farmId);
  }
}