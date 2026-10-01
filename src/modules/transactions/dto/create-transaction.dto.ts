import { TransactionType } from "@prisma/client";
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsPositive,
  IsDateString,
  isString,
} from "class-validator";

export class CreateTransactionDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount!: number;

  @IsEnum(TransactionType)
  @IsNotEmpty()
  type!: TransactionType;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  notes?: string

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsNotEmpty()
  farmId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsOptional()
  clientId?: string;

  @IsString()
  @IsOptional()
  invoiceId?: string;
}