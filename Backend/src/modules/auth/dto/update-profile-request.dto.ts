import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileRequestDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  prenom?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  nom?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  telephone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  photoProfilUrl?: string;
}
