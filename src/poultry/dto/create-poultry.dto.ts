import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PoultryType } from '@prisma/client';

// Pas de "ageInWeeks" ici volontairement — en attente de confirmation
// (calculé depuis entryDate, ou saisi à la main ?). On ne le propose
// pas tant que ce n'est pas tranché, plutôt que de deviner.
export class CreatePoultryDto {
  @IsOptional()
  @IsString()
  tagOrNumber?: string; // identifiant/bracelet — optionnel, un lot peut ne pas être individuellement marqué au départ

  @IsEnum(PoultryType) // PONDEUSE / KUROILER / POULARD
  type: PoultryType;

  @IsOptional()
  @IsString()
  notes?: string;
}