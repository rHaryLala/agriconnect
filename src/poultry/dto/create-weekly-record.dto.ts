import { IsInt, IsOptional, IsNumber, IsString, Min, IsDateString } from 'class-validator';

export class CreateWeeklyRecordDto {
  @IsInt()
  @Min(1)
  weekNumber: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weightKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  ponteRate?: number;

  // Pertes de la semaine, pas un cumul — le service en tiendra
  // l'historique complet via la liste des enregistrements successifs.
  @IsOptional()
  @IsInt()
  @Min(0)
  mortalityCount?: number;

  @IsOptional()
  @IsString()
  vaccineName?: string;

  @IsOptional()
  @IsDateString()
  vaccineDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
