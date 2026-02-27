import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsUUID } from 'class-validator';

export class CreateSouscriptionAssuranceRequestDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  produitAssuranceId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  vehiculeId!: string;

  @ApiPropertyOptional({ type: [String], format: 'uuid' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  optionIds?: string[];
}
