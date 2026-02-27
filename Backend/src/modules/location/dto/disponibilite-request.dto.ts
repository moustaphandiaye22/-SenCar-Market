import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class DisponibiliteRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  annonceLocationId?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsDateString({}, { each: true })
  dates!: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  estDisponible?: boolean;
}
