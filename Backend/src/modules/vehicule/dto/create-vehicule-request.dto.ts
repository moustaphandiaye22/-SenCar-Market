import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateVehiculeRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  marque!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  modele!: string;

  @ApiProperty()
  @Type(() => Number)
  @Min(1900)
  anneeFabrication!: number;

  @ApiProperty()
  @Type(() => Number)
  @Min(0)
  kilometrage!: number;

  @ApiProperty()
  @IsUUID()
  carburantId!: string;

  @ApiProperty()
  @IsUUID()
  boiteVitesseId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  couleur!: string;

  @ApiProperty()
  @Type(() => Number)
  @Min(0)
  prixVente!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  numeroVin!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  immatriculation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  prixNegociable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  certifie?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photosUrls?: string[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  enregistrerEnBrouillon?: boolean;
}
