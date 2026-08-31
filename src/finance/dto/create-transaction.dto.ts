import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { TransactionType } from "@prisma/client";

//DTO pour la création de transaction financière
export class CreateTransactionDto {
    @IsNumber()
    @Min(0.01)
    amount: number

    @IsEnum(TransactionType)
    type: TransactionType;

  // Optionnel : une dépense en liquide sans reçu papier, ça arrive.
    @IsOptional()
    @IsString()
    reference?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    // Lien optionnel vers une facture (ex: le règlement d'une vente).
  // On accepte cet id ici, mais le SERVICE devra vérifier qu'elle existe
  // et appartient à la bonne ferme — jamais fait confiance à un DTO seul,
  // un DTO ne vérifie qu'une FORME, jamais l'existence réelle d'une donnée.
  @IsOptional()
  @IsUUID()
  invoiceId?: string;
}