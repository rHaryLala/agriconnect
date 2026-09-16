import { Module } from '@nestjs/common';
import { PoultryController } from './poultry.controller';
import { PoultryService } from './poultry.service';

@Module({
  controllers: [PoultryController],
  providers: [PoultryService]
})
export class PoultryModule {}
