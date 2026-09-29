import { IsUUID, IsString, MinLength } from "class-validator";

// Puisque le schéma n'a pas encore de lien de correction dédié pour
// Transaction (contrairement à StockMovement.originalMovmentId), ce DTO
// sert à créer manuellement une transaction "inverse" qui annule l'originale.
// C'est un contournement, pas la solution idéale

export class CorrectTransactionDto {
    @IsUUID()
    originalTransactionId: string;

    @IsString()
    @MinLength(10)
    reason: string;
}