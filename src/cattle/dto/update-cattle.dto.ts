import { IsString, IsOptional } from "class-validator";

// Volontairement pas de "status" ici — le statut change uniquement via
// sell() ou recordDeath()
export class UpdateCattleDto {
    @IsOptional()
    @IsString()
    nameOrTag?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}