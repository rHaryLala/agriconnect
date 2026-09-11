import { Controller, Get, Post,Patch, Body, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { ProductVariantService } from "./product-variant.service";
import { CreateVariantDto } from "./dto/create-variant.dto";
import { UpdateVariantDto } from "./dto/update-variant.dto";

type AuthUser = {id: string, role: string, farmId: string};

@ApiTags()
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductVariantController {
    constructor(private service: ProductVariantService) {}

    @Post()
    @Roles('ADMIN') // création/configuration d'article = même règle que StockItem
    create(@Body() dto: CreateVariantDto, @CurrentUser() user: AuthUser)
    {
        return this.service.create(dto, user.farmId)
    }

    @Get('by-item/:stockItemId')
    @Roles('ADMIN', 'OUVRIER', 'COMPTABLE', 'MAGASINIER', 'CONTROLEUR_INTERNE') // lecture large, comme le reste du Stock
    findByItem(@Param('stockItemId') stockItemId: string, @CurrentUser() user: AuthUser)
    {
        return this.service.findByItem(stockItemId, user.farmId);
    }

      @Get(':id')
     @Roles('ADMIN', 'OUVRIER', 'COMPTABLE', 'MAGASINIER', 'CONTROLEUR_INTERNE')
     findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.findOne(id, user.farmId);
  }

  @Patch(':id')
  @Roles('ADMIN') // modifier un prix = décision de gestion, réservée au Gérant
  update(@Param('id') id: string, @Body() dto: UpdateVariantDto, @CurrentUser() user: AuthUser) {
    return this.service.update(id, dto, user.farmId);
  }

}