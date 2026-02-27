import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

import { TYPE_ASSURANCE_VALUES, TypeAssurance } from '../types/assurance.types';

export class CreateProduitAssuranceRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nom!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  prixBase!: number;

  @ApiProperty({ enum: TYPE_ASSURANCE_VALUES })
  @IsEnum(TYPE_ASSURANCE_VALUES)
  typeAssurance!: TypeAssurance;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  dureeMois?: number;
}
