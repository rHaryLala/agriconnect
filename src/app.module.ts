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
import { DashboardModule } from './dashboard.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardModule } from './dashboard/dashboard.module';

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
  ],
  controllers: [AppController, ExempleController, DashboardController], // ExempleController ajouté ici
  providers: [AppService, DashboardService],
})
export class AppModule {}
