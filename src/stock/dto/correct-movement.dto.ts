import { IsString, MinLength } from "class-validator";

export class CorrectMovementDto {
    @IsString()
    @MinLength(10)
    reason: string;

}