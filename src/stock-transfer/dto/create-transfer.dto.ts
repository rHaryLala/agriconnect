import { IsUUID, IsArray, ValidateNested, IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";

// Une ligne du transfert : quel article, quelle quantité.
// Classe séparée (pas juste un objet inline) car @ValidateNested()
// a besoin d'une vraie classe pour valider chaque élément du tableau.
class TransferItemDto {
    @IsUUID()
    itemId: string;

    @IsNumber()
    @Min(0.01)
    quantity: number;

}
export class CreateTransferDto{
    @IsUUID()
    fromLocationId: string;

    @IsUUID()
    toLocationId: string;

    @IsArray()
    @ValidateNested({each: true}) // valide CHAQUE élément du tableau avec les règles de TransferItemDto
    @Type(() => TransferItemDto)  //dit à class-transformer quelle classe utiliser pour chaque ligne du JSON reçu
    items: TransferItemDto[];
}