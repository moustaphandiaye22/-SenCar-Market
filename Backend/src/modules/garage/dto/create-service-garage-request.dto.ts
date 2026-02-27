import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

import { CATEGORIE_SERVICE_GARAGE_VALUES, CategorieServiceGarage } from '../types/garage.types';

export class CreateServiceGarageRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nom!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  prix?: number;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  dureeEstimee?: number;

  @ApiPropertyOptional({ enum: CATEGORIE_SERVICE_GARAGE_VALUES })
  @IsOptional()
  @IsEnum(CATEGORIE_SERVICE_GARAGE_VALUES)
  categorie?: CategorieServiceGarage;
}
