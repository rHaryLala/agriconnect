import { IsOptional, IsUUID, IsEnum } from "class-validator";
import { MouvementType } from "../../../generated/prisma";

export class FilterHistoriqueDto {
    @IsOptional()
    @IsUUID()
    itemId?: string;

    @IsOptional()
    @IsEnum(MouvementType)
    type?: MouvementType;
}
