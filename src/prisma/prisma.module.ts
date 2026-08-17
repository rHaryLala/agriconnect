import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // rend PrismaService disponible partout sans ré-importer le module à chaque fois
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}