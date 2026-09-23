import { IsOptional, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { MouvementType, CultureType } from '@prisma/client';

export class FilterHistoriqueDto {
  @IsOptional()
  @IsUUID()
  itemId?: string;

  @IsOptional()
  @IsEnum(MouvementType)
  type?: MouvementType;

  @IsOptional()
  @IsDateString() // filtre : mouvements à partir de cette date
  dateDebut?: string;

  @IsOptional()
  @IsDateString() // filtre : mouvements jusqu'à cette date
  dateFin?: string;

  // Semaine 3 : ventiler l'historique par culture, pour le suivi des engrais.
  @IsOptional()
  @IsEnum(CultureType)
  cultureType?: CultureType;
}
