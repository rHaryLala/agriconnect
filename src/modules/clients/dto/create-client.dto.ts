import { IsEmail, IsNotEmpty, IsOptional, IsString, isPhoneNumber} from "class-validator";

export class CreateClientDto {
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    phone?: string;
}
