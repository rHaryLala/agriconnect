import { IsString, IsEnum, IsOptional } from "class-validator";
import { Role } from "@prisma/client";

// Volontairement PAS de "password" ici : changer un mot de passe est une
// opération sensible qui mérite son propre endpoint dédié plus tard
// (avec ses propres règles, ex: demander l'ancien mot de passe)

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    firstname?: string;

    @IsOptional()
    @IsString()
    lastname?: string;

    @IsOptional()
    @IsEnum(Role)
    role?: Role;
}
