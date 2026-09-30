import { IsString, IsOptional, IsEmail, IsNumber, Min, Max, IsArray, IsEnum } from "class-validator";
import { Supplier, SupplierStatus } from "@prisma/client";

export class UpdateSupplierDto {
    @IsOptional()
    @IsString()
    name?: string;

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
    rating?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    payementTermDays?: number;

    @IsOptional()
    @IsArray()
    @IsString({each: true})
    products?: string[];

    //ici "status" a du sens, puisque
    // désactiver un fournisseur (ACTIF → INACTIF) est justement
    // le genre de modification que cet endpoint doit permettre.
    @IsOptional()
    @IsEnum(SupplierStatus)
    status?: SupplierStatus;
}