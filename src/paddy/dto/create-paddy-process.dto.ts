import { IsInt, IsNumber, IsOptional, IsString, IsNotEmpty, Min, IsDateString } from 'class-validator';

/**
 * Stack : DTO `class-validator`. Le ValidationPipe global (main.ts) le lit avant
 * que le contrôleur ne soit appelé, avec `whitelist` et `forbidNonWhitelisted` :
 * tout champ non déclaré ici est refusé en 400. Un champ oublié dans ce fichier
 * est donc un champ que le client ne peut pas envoyer, même si la colonne existe.
 *
 * Métier : ouvrir un lot, c'est enregistrer une récolte de paddy. `farmId` et
 * `userId` ne figurent volontairement pas ici — ils viennent du JWT via
 * @CurrentUser, sinon n'importe quel appelant pourrait écrire au nom d'un autre.
 */
export class CreatePaddyProcessDto {
  // Numéro de lot saisi par la ferme (pas généré) : c'est celui inscrit sur les
  // gony, donc le seul repère commun entre le magasin et l'application.
  @IsString()
  @IsNotEmpty()
  lotNumber: string;

  @IsNumber()
  @Min(0)
  paddyInputKg: number;

  // Nombre de gony. Le poids seul ne suffit pas : la ferme compte en sacs à la
  // réception, et l'écart sacs/kg est le premier signe d'une erreur de pesée.
  @IsInt()
  @Min(0)
  paddyInputLot: number;

  @IsOptional()
  @IsDateString()
  harvestDate?: string;

  @IsOptional()
  @IsString()
  transport?: string;

  @IsOptional()
  @IsString()
  driverName?: string;

  @IsOptional()
  @IsString()
  storekeeperName?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
