import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class RetraitRequestDto {
  @ApiProperty({ example: 10000 })
  @IsNumber()
  @Min(0.01)
  montant!: number;

  @ApiProperty({ example: '770000000' })
  @IsString()
  telephone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nomBeneficiaire?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  banque?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  numeroCompte?: string;
}
