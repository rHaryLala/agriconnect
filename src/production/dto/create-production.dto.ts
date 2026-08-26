import { IsEnum, IsNumber, Min, IsString, IsOptional, IsUUID, IsDateString } from "class-validator";
import { ProductionType } from "@prisma/client";

export class CreateProductionDto {
    @IsEnum(ProductionType) //OEUF, LAIT, VIANDE, RECOLTES
    type: ProductionType;

    @IsNumber()
    @Min(0.01)
    quantity: number;

    @IsString()
    unit: string;

    @IsOptional()
    @IsString()
    notes?: string;


  // Optionnel : une production peut exister sans article de stock
  // correspondant (catalogue pas encore à jour) — dans ce cas, pas
  // d'entrée en stock automatique, juste l'enregistrement de production.
  @IsOptional()
  @IsUUID()
  stockItemId?: string;

   // Optionnel : permet la saisie rétroactive (RG-07). Validée dans le
  // service selon le rôle, pas ici — un DTO vérifie une FORME, jamais
  // une règle métier qui dépend de qui fait la requête.
    @IsOptional()
    @IsDateString()
    date?: string;
}