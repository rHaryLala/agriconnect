import { IsString, IsOptional, IsEmail, IsNumber, Min, Max, IsArray } from "class-validator";

export class CreateSupplierDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(5)
    rating?: number; //Note sur 5 etoile

    @IsOptional()
    @IsNumber()
    @Min(0)
    paymentTermDays?: number;

    @IsOptional()
    @IsArray()
    @IsString({each: true}) // vérifie que CHAQUE élément du tableau est bien une chaîne
    products?: string[];
}