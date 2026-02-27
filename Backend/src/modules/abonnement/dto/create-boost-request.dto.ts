import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, IsUUID } from 'class-validator';

export class CreateBoostRequestDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  annonceLocationId!: string;

  @ApiProperty({ example: '2026-03-01T00:00:00.000Z' })
  @IsDateString()
  dateDebut!: string;

  @ApiProperty({ example: '2026-03-15T00:00:00.000Z' })
  @IsDateString()
  dateFin!: string;

  @ApiProperty()
  @IsString()
  niveauBoost!: string;
}
