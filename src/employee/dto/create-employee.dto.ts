import { IsString, IsOptional } from "class-validator";

export class CreateEmployeeDto {
    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

     @IsOptional()
     @IsString()
     matricule?: string;

     @IsOptional()
     @IsString()
     department?: string; //Département de la ferme, demandé dans le cahier de charge

    @IsOptional()
    @IsString()
    position?: string; //Poste de l'employé 

    @IsOptional()
    @IsString()
    phone?: string;

     // Pas de "userId" ni "clientId" ici volontairement : lier un compte
  // de connexion ou un profil client existant est une action distincte
  // et plus sensible
}