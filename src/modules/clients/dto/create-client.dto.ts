import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ClientType } from '@prisma/client';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(ClientType)
  @IsOptional()
  type?: ClientType;

  @IsString()
  @IsOptional()
  matriculeuaz?: string;

  @IsString()
  @IsNotEmpty()
  farmId!: string;
}