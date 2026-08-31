import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { TransactionType } from "@prisma/client";

//DTO pour la création de transaction financière
export class CreateTransactionDto {
    @IsNumber()
    @Min(0.01)
    amount: number

    @IsEnum(TransactionType)
    type: TransactionType;

    /**
   * Référence facultative.
   *
   * Exemple :
   * - numéro de reçu
   * - numéro de bordereau
   */
    @IsOptional()
    @IsString()
    reference?: string;

    @IsOptional()
    @IsString()
    notes?: string;

}