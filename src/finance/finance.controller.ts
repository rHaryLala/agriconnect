import { Controller, Get, Post, Body, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Role } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { FinanceService } from "./finance.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { FilterTransactionDto } from "./dto/filter-transaction.dto";
import { CorrectTransactionDto } from "./dto/correct-transaction.dto";
import { Roles } from "../auth/decorators/roles.decorator";

type AuthUser = {id: string, role:string, farmId: string};

@ApiTags('finance')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)  // authentification obligatoire sur toutes les routes
@Roles('ADMIN', 'COMPTABLE')
export class FinanceController
{
    constructor(private financeService: FinanceService) {}

    @Post('transactions')
    create(@Body() dto: CreateTransactionDto, @CurrentUser() user: AuthUser)
    {
        return this.financeService.create(dto, user.id, user.farmId);
    }

    @Get('transactions')
    findAll(@Query() filters: FilterTransactionDto, @CurrentUser() user: AuthUser)
    {
        return this.financeService.findAll(user.farmId, filters);
    }

    @Get('transactions/:id')
    findOne(@Param('id') id:string, @CurrentUser() user: AuthUser)
    {
        return this.financeService.findOne(id, user.farmId);
    }

    @Get('Journal-caisse')
    journalDeCaisse(@CurrentUser() user: AuthUser)
    {
        return this.financeService.journalDeCaisse(user.farmId);
    }

    @Get('benefice')
    benefice(@Query() filters: FilterTransactionDto, @CurrentUser() user:AuthUser)
    {
        return this.financeService.calculerBenefice(user.farmId, filters);
    }

    @Post('transactions/correction')
    correct(@Body() dto: CorrectTransactionDto, @CurrentUser() user: AuthUser)
    {
        return this.financeService.correct(dto, user.id, user.farmId)
    }
}
