import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from "class-validator";

export class UpdateVehiculeRequestDto {
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
  @Type(() => Number)
  @Min(1900)
  anneeFabrication?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  kilometrage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID("all")
  carburantId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID("all")
  boiteVitesseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  couleur?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  prixVente?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  numeroVin?: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  titre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  nombrePortes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  nombrePlaces?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cylindree?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  puissanceFiscale?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  estGarantie?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  garantieMois?: number;

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
