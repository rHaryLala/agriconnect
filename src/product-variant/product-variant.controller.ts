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

// Stack : contrôleur NestJS. Il ne porte aucune logique métier — il déclare les
// routes HTTP, applique les gardes, et délègue tout le reste au service.
//
// Le chemin 'product-variants' est indispensable : sans argument, @Controller()
// monte ses routes à la racine de l'API. Le @Get(':id') plus bas devenait alors
// GET /api/v1/:id, c'est-à-dire un joker qui interceptait les routes voisines
// (/api/v1/stock, /api/v1/finance…) selon l'ordre d'enregistrement des modules.
//
// Métier : c'est ce contrôleur qui porte les haricots secs de la Semaine 3. Le
// cahier des charges §2.1.6 les décrit comme un seul article de stock
// (« Haricot sec ») décliné en variantes de couleur — blanc et rouge — et non
// comme deux articles distincts : le stock physique est commun, seule la
// valorisation diffère. Une variante = une ligne ProductVariant.
@ApiTags('product-variants')
@ApiBearerAuth()
@Controller('product-variants')
// JwtAuthGuard établit l'identité (req.user), RolesGuard lit ensuite les @Roles
// de chaque route. L'ordre compte : sans identité, il n'y a pas de rôle à vérifier.
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