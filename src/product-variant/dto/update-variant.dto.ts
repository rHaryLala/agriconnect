import { IsString, IsOptional, IsNumber, Min } from "class-validator";

// Volontairement pas de "quantity" ici, même principe que UpdateStockDto :
// la quantité ne se modifie jamais par simple édition, seulement par
// un mouvement tracé.
export class UpdateVariantDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    sku?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    unitPrice?: number;
}