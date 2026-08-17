import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        PrismaModule,
        ConfigModule.forRoot({isGlobal: true}),  // charge le .env, accessible partout via ConfigService
    ], // ajouté ici
})
export class AppModule {}