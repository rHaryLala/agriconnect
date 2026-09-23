import { Controller,Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { ReportsService } from "./reports.service";
import { MonthlyReportQueryDto } from "./dto/monthly-report-query.dto";

type AuthUser = {id:string, role: string, farmId: string};

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'COMPTABLE', 'CONTROLEUR_INTERNE')
export class ReportsController {
    constructor(private reportsService: ReportsService) {}

    @Get('monthly')
    getMonthlyReport(@Query() query: MonthlyReportQueryDto, @CurrentUser() user: AuthUser) {
        return this.reportsService.getMonthlyReport(user.farmId, query.month);
    }
}