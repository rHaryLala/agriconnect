import { IsString, MinLength } from "class-validator";

export class RecordDeathDto {
    @IsString()
    @MinLength(5)
    deathReason: string;
}