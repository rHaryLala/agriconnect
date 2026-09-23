import { Module } from '@nestjs/common';
import { PaddyController } from './paddy.controller';
import { PaddyService } from './paddy.service';

/**
 * Stack : module NestJS. C'est l'unité d'assemblage du framework — elle déclare
 * le contrôleur (les routes) et le service (la logique). PrismaModule n'est pas
 * importé ici parce qu'il est global (@Global dans prisma.module.ts) : le
 * PrismaService est donc injectable sans import explicite.
 *
 * Il reste à enregistrer ce module dans AppModule, sinon Nest ne le charge pas
 * et les routes n'existent tout simplement pas.
 */
@Module({
  controllers: [PaddyController],
  providers: [PaddyService],
})
export class PaddyModule {}
