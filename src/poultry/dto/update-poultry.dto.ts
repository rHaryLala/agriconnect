import { IsOptional, IsString } from "class-validator";

export class UpdatePoultryDto {
    @IsOptional()
    @IsString()
    tagOrNumber?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}