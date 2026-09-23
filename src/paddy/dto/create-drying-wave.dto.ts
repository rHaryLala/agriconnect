import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min, IsDateString } from 'class-validator';
import { DryingEventType } from '@prisma/client';

/**
 * Stack : DTO `class-validator`. L'enum vient directement de `@prisma/client`,
 * donc ajouter une valeur au schéma suffit — aucune liste à maintenir en double.
 *
 * Métier : un séchage se déroule en plusieurs vagues sur plusieurs jours.
 *  - PASSAGE      : le paddy sort sur l'aire le matin et rentre le soir. On note
 *                   les deux pesées ; la différence est l'humidité perdue.
 *  - FINALISATION : le lot est déclaré sec, remis en gony et repesé. Cette
 *                   quantité quitte le stock brut pour le stock sec.
 *
 * Les champs des deux cas sont tous optionnels ici parce qu'aucun n'est valide
 * dans les deux situations. La règle « lequel est obligatoire quand » est portée
 * par le service : class-validator ne sait pas conditionner un champ à la valeur
 * d'un autre sans décorateur sur mesure, et une règle métier lisible dans le
 * service vaut mieux qu'une validation astucieuse mais invisible.
 */
export class CreateDryingWaveDto {
  @IsEnum(DryingEventType)
  type: DryingEventType;

  @IsOptional()
  @IsDateString()
  date?: string;

  // PASSAGE — quantité sortie vers l'aire de séchage
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantityOutKg?: number;

  // PASSAGE — quantité revenue au magasin le soir
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantityReturnedKg?: number;

  // FINALISATION — nombre de gony reconstitués
  @IsOptional()
  @IsInt()
  @Min(0)
  bags?: number;

  // FINALISATION — poids du paddy sec obtenu
  @IsOptional()
  @IsNumber()
  @Min(0)
  dryPaddyKg?: number;

  @IsOptional()
  @IsString()
  note?: string;
}
