import { IsUUID, IsNumber, Min, IsOptional, IsString } from "class-validator";

// Vendre un bovin n'est pas juste "modifier un champ" : ça doit aussi
// générer une recette (Finance). Une action à part, comme "correct"
// sur Stock
export class SellCattleDto {
    @IsUUID()
    clientId: string;

    @IsNumber()
    @Min(0.01)
    salePrice: number;

    @IsOptional()
    @IsString()
    signature?: string; // URL/chemin de la signature de validation
}