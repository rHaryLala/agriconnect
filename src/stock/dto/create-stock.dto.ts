import { IsNumber, IsOptional, IsString, Min } from "class-validator";
export class CreateStockDto {
    @IsString()
    name: string;

    // Optionnelle : le front n'a pas cette notion. L'exiger l'obligerait a
    // inventer une valeur, donc a mettre une donnee fausse en base. Le service
    // applique un defaut.
    @IsOptional()
    @IsString()
    category?: string;

    @IsNumber()
    @Min(0)
    quantity: number;

    //Unité utilisé pour mésurer le stock
    @IsString()
    unit: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    miniAlert?: number;
}