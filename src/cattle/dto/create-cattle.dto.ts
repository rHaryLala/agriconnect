import { IsString, IsOptional, IsEnum, IsDateString } from "class-validator";
import { EntryTypeBovin } from "@prisma/client";

export class CreateCattleDto {
    @IsString()
    nameOrTag: string; // Nom ou étiquette d'identification

    @IsString()
    gender: string;

    @IsOptional()
    @IsString()
    category?: string; // ex: "Vache laitière" — déjà une valeur par défaut au schéma

    @IsEnum(EntryTypeBovin)
    entryType: EntryTypeBovin; // NAISSANCE ou ACHAT

    @IsOptional()
    @IsDateString()
    birthDate?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}