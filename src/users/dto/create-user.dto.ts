import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from "class-validator";
import { Role } from "@prisma/client";

 //un Admin PEUT choisir le rôle du compte qu'il crée
export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsOptional()
    @IsEnum(Role)// vérifie que la valeur est bien ADMIN, COMPTABLE ou OUVRIER 
    role?: Role;
}
