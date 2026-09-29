import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { MouvementType } from "@prisma/client";

//DTO pour l'enregistrement des entrées, sorties ou ajustement de stock

export class CreateStockMovementDto {
    @IsOptional()
    @IsUUID()
    variantId?: string; // si le mouvement concerne une variante précise (ex: "Oeufs GM Normal")
    
    @IsEnum(MouvementType)
    type: MouvementType;

    @IsNumber()
    @Min(0.01)
    quantity: number;

    //Motif facultatif
    @IsOptional()
    @IsString()
    reason?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    repeseeQuantity?: number;
}
