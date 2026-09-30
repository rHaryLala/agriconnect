import { IsNumber, Min, IsOptional, IsString, IsDateString } from 'class-validator';

// Pas de "reference" ici — même principe que Invoice.invoiceNumber :
// une numérotation séquentielle attribuée par le SERVEUR, jamais reçue
// du client, pour éviter les doublons que l'audit avait signalés sur
// la numérotation des factures front (F-B5).
export class CreatePurchaseDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0.01)
  totalAmount: number;

  @IsOptional()
  @IsDateString()
  date?: string;
}