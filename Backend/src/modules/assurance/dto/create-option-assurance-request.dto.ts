import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateOptionAssuranceRequestDto {
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
  prixSupplementaire!: number;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  produitAssuranceId!: string;
}
