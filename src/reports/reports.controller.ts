import { Controller,Get, Query, Res, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { ReportsService } from "./reports.service";
import { MonthlyReportQueryDto } from "./dto/monthly-report-query.dto";
import { StreamableFile } from "@nestjs/common";
import type { Response } from 'express';
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

    
        @Get('monthly/pdf')
    async downloadPdf(
  @Query() query: MonthlyReportQueryDto,
  @CurrentUser() user: AuthUser,
  @Res({ passthrough: true }) res: Response,
) {
  const buffer = await this.reportsService.generateMonthlyReportPdf(user.farmId, query.month);

  // "passthrough: true" laisse NestJS gérer la réponse normalement
  // (interceptors, filtres d'exception inclus) — on ne fait qu'ajouter
  // les en-têtes nécessaires au téléchargement, pas gérer la réponse
  // brute.
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="rapport-${query.month}.pdf"`,
  });

  return new StreamableFile(buffer);
}

@Get('monthly/excel')
async downloadExcel(
  @Query() query: MonthlyReportQueryDto,
  @CurrentUser() user: AuthUser,
  @Res({ passthrough: true }) res: Response,
) {
  const buffer = await this.reportsService.generateMonthlyReportExcel(user.farmId, query.month);

  res.set({
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': `attachment; filename="rapport-${query.month}.xlsx"`,
  });

  return new StreamableFile(buffer);
}
}