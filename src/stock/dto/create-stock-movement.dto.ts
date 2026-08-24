import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { MouvementType } from "../../../generated/prisma";

//DTO pour l'enregistrement des entrées, sorties ou ajustement de stock

export class CreateStockMovementDto {
    @IsEnum(MouvementType)
    type: MouvementType;

    @IsNumber()
    @Min(0.01)
    quantity: number;

    //Motif facultatif
    @IsOptional()
    @IsString()
    reason?: string;

}