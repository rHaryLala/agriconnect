import { IsNumber, Min, IsOptional, IsUUID, IsDateString, IsString } from "class-validator";

export class CreateMilkRecordDto {
    @IsNumber()
    @Min(0.01)
    quantityL: number;

    // Optionnel : lie la traite à un article de stock (ex: "Lait"),
  // pour déclencher l'entrée automatique en stock — même principe
  // que Production.stockItemId
  @IsOptional()
  @IsUUID()
  stockItemId?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}