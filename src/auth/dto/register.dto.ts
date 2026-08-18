import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDTO {
    @IsEmail() //doir ressembler à une email valide
    email: string;

    @IsString()
    @MinLength(8) //Mot de passe < 8
    password: string;

    @IsString()
    firstname: string;

    @IsString()
    lastName: string;

}
