import { IsUUID, IsString, IsOptional, IsNumber, Min } from "class-validator";
export class CreateVariantDto {
    @IsUUID()
    stockItemId: string;

    @IsString()
    name: string; // ex: "Gros Modèle Normal

    @IsOptional()
    @IsString()
    sku?: string; // code article, facultatif

    @IsNumber()
    @Min(0)
    unitPrice: number; // le prix distinct par variante, demandé dans le cahier des charges

    // Quantité de départ, facultative — la plupart du temps une variante
  // démarre à 0 et se remplit via des mouvements de stock (une fois
  // "variantId" ajouté sur StockMovement)
    @IsOptional()
    @IsNumber()
    @Min(0)
    quantity?: number;
}