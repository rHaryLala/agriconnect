import { IsNumber, IsOptional, IsString, IsUUID, Min, IsDateString } from 'class-validator';

/**
 * Stack : DTO `class-validator`.
 *
 * Métier : le décorticage consomme du paddy sec et produit du riz. Les deux
 * quantités sont saisies séparément et jamais déduites l'une de l'autre : le
 * rendement dépend de la machine et de la qualité du lot, il se constate, il ne
 * se suppose pas. Il reste donc calculable (riz / paddy) sans être stocké.
 */
export class CreateMillingDto {
  @IsNumber()
  @Min(0)
  paddyUsedKg: number;

  @IsNumber()
  @Min(0)
  riceOutputKg: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  /**
   * Article de stock qui reçoit le riz produit (« Riz décortiqué »).
   *
   * Renseigné, le service crée en plus un mouvement d'entrée : sans cela le riz
   * n'existerait que dans la table paddy, et resterait invendable puisque toute
   * la facturation passe par le stock. Optionnel pour qu'une ferme qui n'a pas
   * encore créé l'article puisse quand même enregistrer son décorticage.
   */
  @IsOptional()
  @IsUUID()
  riceStockItemId?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
