import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class EstimationRequestDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  vehiculeId?: string;

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

  @ApiProperty()
  @IsNumber()
  @Min(1)
  kilometrage!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  etatVehicule!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
