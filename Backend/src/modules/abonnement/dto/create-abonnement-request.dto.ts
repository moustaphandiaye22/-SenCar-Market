import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

import { TYPE_ABONNEMENT_VALUES, TypeAbonnement } from '../types/abonnement.types';

export class CreateAbonnementRequestDto {
  @ApiProperty()
  @IsString()
  nom!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 15000 })
  @IsNumber()
  @Min(0.01)
  prixMensuel!: number;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @Min(1)
  dureeJours!: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(1)
  nombreAnnonces!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  estVedette?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  estCertifie?: boolean;

  @ApiPropertyOptional({ enum: TYPE_ABONNEMENT_VALUES })
  @IsOptional()
  @IsEnum(TYPE_ABONNEMENT_VALUES)
  type?: TypeAbonnement;
}
