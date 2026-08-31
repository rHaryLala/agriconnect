import { IsString, IsOptional } from "class-validator";

// Volontairement pas de "quantity" ni "stockItemId" ici — même logique
// que UpdateStockDto : une quantité déjà répercutée en stock ne se
// corrige jamais par simple édition (RG-06), seulement par une vraie
// opération de correction (qu'on pourra ajouter plus tard si besoin,
// symétrique de correctMovement côté Stock).

export class UpdateProductionDto {
    @IsOptional()
    @IsString()
    notes?: string;
}