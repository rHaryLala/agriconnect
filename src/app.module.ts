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
import { ClientsModule } from './modules/clients/clients.module';
import { TransactionsModule } from './modules/transactions/transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // charge .env
    PrismaModule,
    AuthModule,
    UsersModule,
    StockModule,
    ProductionModule,
    FinanceModule,
    ClientsModule,
    TransactionsModule,
  ],
  controllers: [AppController, ExempleController], // ExempleController ajouté ici
  providers: [AppService],
})
export class AppModule {}