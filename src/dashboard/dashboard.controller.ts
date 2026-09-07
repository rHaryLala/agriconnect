import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { DashboardService } from "./dashboard.service";
import { DashboardQueryDto } from "./dto/dashboard-query.dto";

// Reprend exactement la forme que JwtStrategy.validate() met dans request.user
type AuthUser = {id:string, role:string, farmId: string};

@ApiTags('dashboard') // regroupe cette route sous "dashboard" dans Swagger
@ApiBearerAuth()
@Controller('dashboard') // toutes les routes ci-dessous commencent par /dashboard
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN, COMPTABLE')
export class DashboardController {
    constructor(private dashboardService: DashboardService) {}

    @Get('summary')
    getSummary(@Query() query: DashboardQueryDto, @CurrentUser() user: AuthUser)
    {
        // @Query() récupère et valide automatiquement le paramètre "date"
    // depuis l'URL (ex: /dashboard/summary?date=2026-09-01), grâce au
    // ValidationPipe global déjà configuré dans main.ts.
    return this.dashboardService.getSummary(user.farmId, query.date);
    }
}