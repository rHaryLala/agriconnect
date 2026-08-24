import { IsNumber, IsOptional, IsString, Min } from "class-validator";
export class CreateStockDto {
    @IsString()
    name: String;

    @IsString()
    category: string;

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