import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

/**
 * Stack : DTO `class-validator`, lu par le ValidationPipe global avant le
 * contrôleur.
 *
 * Métier : une activité agricole de la ferme (« Mamboly vary », « Manangona
 * atody »…). Seul le libellé est saisi ; la ferme vient du JWT, jamais du corps
 * de la requête, pour qu'on ne puisse pas créer une activité chez un voisin.
 */
export class CreateLaborActivityDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;
}
