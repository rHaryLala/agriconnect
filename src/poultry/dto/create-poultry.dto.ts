import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PoultryType } from '@prisma/client';

// Pas de "ageInWeeks" ici - pour l'instant
export class CreatePoultryDto {
  @IsOptional()
  @IsString()
  tagOrNumber?: string; // identifiant/bracelet — optionnel, un lot peut ne pas être individuellement marqué au départ

  @IsEnum(PoultryType) // PONDEUSE / KUROILER / POULARD
  type: PoultryType;

  //Âge au moment de la création
  @IsOptional()
  @IsInt()
  @Min(0)
  initialAge?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
