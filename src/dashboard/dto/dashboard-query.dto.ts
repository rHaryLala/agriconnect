import { IsOptional, IsDateString } from "class-validator";

// Un seul champ, optionnel : quel jour on veut regarder pour la
// "production du jour". Si l'utilisateur ne précise rien, le service
// utilisera la date du jour par défaut

export class DashboardQueryDto{
    @IsOptional()
    @IsDateString()
    date?: string;
}
