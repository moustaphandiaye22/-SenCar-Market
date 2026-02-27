import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateAnnonceLocationRequestDto {
  @ApiProperty()
  @IsUUID()
  vehiculeId!: string;

  @ApiProperty()
  @Type(() => Number)
  @Min(0)
  tarifJournalier!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  conditions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  caution?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  kilometrageInclus?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  tarifKmSupplementaire?: number;
}
