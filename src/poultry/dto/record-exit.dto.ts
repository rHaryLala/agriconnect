import { IsEnum, IsString, MinLength } from "class-validator";
import { PoultryStatus } from "@prisma/client";

// Couvre les sorties autres que la vente : décès, perte, ou mise en
// couveuse 
export class RecordExitDto {
    @IsEnum(PoultryStatus)
    status: PoultryStatus; // DECEDE ou EN_COUVEUSE

    @IsString()
    @MinLength(5)
    exitReason: string;
}