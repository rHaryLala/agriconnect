import { Matches } from "class-validator";

export class MonthlyReportQueryDto {
     // Format "YYYY-MM" imposé (ex: "2026-09"), pas une date complète car
    // un rapport mensuel porte sur un MOIS entier, pas un instant précis.
    @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
        message: 'Le mois doit être au format YYYY-MM (ex: 2026-09',
    })
    month: string;
}