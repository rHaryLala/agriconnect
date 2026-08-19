import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ExempleController } from './exemple.controller'; // ligne ajoutée

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // charge .env
    PrismaModule,
    AuthModule,
  ],
  controllers: [AppController, ExempleController], // ExempleController ajouté ici
  providers: [AppService],
})
export class AppModule {}