import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ExempleController } from './exemple.controller'; // ligne ajoutée
import { UsersModule } from './users/users.module';
import { StockModule } from './stock/stock.module';
import { ProductionModule } from './production/production.module';
import { FinanceModule } from './finance/finance.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DashboardController } from './dashboard/dashboard.controller';
import { DashboardService } from './dashboard/dashboard.service';
import { StockTransferModule } from './stock-transfer/stock-transfer.module';
import { ProductVariantModule } from './product-variant/product-variant.module';
import { CattleModule } from './cattle/cattle.module';
import { PoultryModule } from './poultry/poultry.module';
import { ReportsModule } from './reports/reports.module';
import { PaddyModule } from './paddy/paddy.module'; // Semaine 3 - riziculture
import { LaborModule } from './labor/labor.module'; // Semaine 3 - main d'oeuvre journaliere

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // charge .env
    PrismaModule,
    AuthModule,
    UsersModule,
    StockModule,
    ProductionModule,
    FinanceModule,
    DashboardModule,
    StockTransferModule,
    ProductVariantModule,
    CattleModule,
    PoultryModule,
    ReportsModule,
    PaddyModule,
    LaborModule,
  ],
  controllers: [AppController, ExempleController, DashboardController], // ExempleController ajouté ici
  providers: [AppService, DashboardService],
})
export class AppModule {}
