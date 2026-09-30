import { IsNumber, Min, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { SupplierPaymentMethod } from '@prisma/client';

export class CreateSupplierPaymentDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(SupplierPaymentMethod)
  method: SupplierPaymentMethod;

  @IsOptional()
  @IsDateString()
  date?: string;
}