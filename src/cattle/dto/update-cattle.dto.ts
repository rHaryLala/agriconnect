import { IsString, IsOptional, IsEnum } from "class-validator";
import { ReproductionBovin } from "@prisma/client";

// Volontairement pas de "status" ici — le statut change uniquement via
// sell() ou recordDeath()
export class UpdateCattleDto {
    @IsOptional()
    @IsString()
    nameOrTag?: string;

    @IsOptional()
    @IsString()
    breed?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsEnum(ReproductionBovin)
    reproduction?: ReproductionBovin;

    @IsOptional()
    @IsString()
    notes?: string;
}
