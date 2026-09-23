import { Module } from '@nestjs/common';
import { LaborController } from './labor.controller';
import { LaborService } from './labor.service';

/**
 * Stack : module NestJS. PrismaModule etant @Global, le PrismaService est
 * injectable sans import explicite ici.
 *
 * Perimetre : journal de main d'oeuvre journaliere (Semaine 3, CDC 2.1.4).
 */
@Module({
  controllers: [LaborController],
  providers: [LaborService],
})
export class LaborModule {}
