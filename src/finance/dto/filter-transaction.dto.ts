import { IsOptional, IsEnum, IsDateString } from "class-validator";
import { TransactionType } from "@prisma/client";

// Tous les champs sont optionnels : l'utilisateur peut combiner librement
// (juste une période, juste un type, les deux, ou rien = tout afficher).
export class FilterTransactionDto {
    @IsOptional()
    @IsEnum(TransactionType)
    type?: TransactionType

    @IsOptional()
    @IsDateString()
    dateDebut?: string;

    @IsOptional()
    @IsDateString()
    dateFin?: string;
}