import { IsInt, IsOptional, IsString, IsUUID, Min, IsDateString } from 'class-validator';

/**
 * Stack : DTO `class-validator`.
 *
 * Métier : une ligne du journal = un jour, une activité, un effectif. C'est la
 * maille réelle de comptage sur le terrain : le chef d'équipe sait combien de
 * personnes ont sarclé aujourd'hui, pas lesquelles nommément.
 */
export class CreateLaborLogDto {
  @IsUUID()
  activityId: string;

  /**
   * Effectif présent ce jour-là sur cette activité.
   *
   * Min(1) et non Min(0) : une journée à zéro travailleur n'est pas une donnée,
   * c'est une ligne qu'il ne fallait pas créer. L'accepter fausserait la moyenne
   * d'effectif par jour, qui divise par le nombre de jours saisis.
   */
  @IsInt()
  @Min(1)
  workerCount: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
