import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { ProductionService } from "./production.service";
import { CreateProductionDto } from "./dto/create-production.dto";
import { UpdateProductionDto } from "./dto/update-production.dto";


type AuthUser = {id:string, role: string, farmId: string};

@ApiTags('production')
@ApiBearerAuth()
@Controller('production')
@UseGuards(JwtAuthGuard, RolesGuard)

export class ProductionController {
    constructor(private productionService: ProductionService) {}

    @Post()
    @Roles('ADMIN', 'OUVRIER')  // matrice Sprint 1 : L, C pour l'Employé de terrain
    create(@Body() dto:CreateProductionDto, @CurrentUser() user: AuthUser) {
        return this.productionService.create(dto, user.id, user.role, user.farmId);
    }

    @Get()
    @Roles('ADMIN', 'OUVRIER', 'COMPTABLE')
    findAll(@CurrentUser() user: AuthUser, @Query('type') type?: string)
    {
        return this.productionService.findAll(user.farmId, type);
    }

    @Get(':id')
    @Roles('ADMIN', 'OUVRIER', 'COMPTABLE')
    findOne(@Param('id') id: string,  @CurrentUser() user: AuthUser)
    {
        return this.productionService.findOne(id, user.farmId);
    }
    
    @Patch(':id')
    @Roles('ADMIN')
    update(@Param('id') id:string, @Body() dto: UpdateProductionDto, @CurrentUser() user: AuthUser)
    {
        return this.productionService.update(id, dto, user.farmId);
    }

}
