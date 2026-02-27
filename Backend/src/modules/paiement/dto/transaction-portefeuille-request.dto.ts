import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

import { TYPE_TRANSACTION_VALUES, TypeTransaction } from '../types/paiement.types';

export class TransactionPortefeuilleRequestDto {
  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(0.01)
  montant!: number;

  @ApiProperty({ enum: TYPE_TRANSACTION_VALUES })
  @IsEnum(TYPE_TRANSACTION_VALUES)
  typeTransaction!: TypeTransaction;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referencePaiement?: string;
}
