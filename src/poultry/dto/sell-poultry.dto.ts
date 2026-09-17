import { IsNumber, Min } from "class-validator";

export class SellPoultryDto {
    @IsNumber()
    @Min(0.01)
    salePrice: number;
}