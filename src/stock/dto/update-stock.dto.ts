import { IsNumber, IsOptional, IsString, Min } from "class-validator";

//DTO utilisé pour modifier les informations générales d'un article de stock

//Volontairement pas de quantity puisque la quantité se doit d'être modifié par un
//mouvement de stock
export class UpdateStockDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    unit?:string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    miniAlert?: number;
}
