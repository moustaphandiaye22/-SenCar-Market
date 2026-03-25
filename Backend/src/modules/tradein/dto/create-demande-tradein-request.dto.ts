import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateDemandeTradeInRequestDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  vehiculeActuelId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  marque?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  modele?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  anneeFabrication?: number;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  vehiculeSouhaiteId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  kilometrage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  kilometrageActuel?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  etatVehicule!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
