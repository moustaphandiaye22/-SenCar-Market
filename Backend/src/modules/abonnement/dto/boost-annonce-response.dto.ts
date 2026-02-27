import { ApiProperty } from '@nestjs/swagger';

export class BoostAnnonceResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  annonceLocationId!: string;

  @ApiProperty({ nullable: true })
  dateDebut!: Date | null;

  @ApiProperty({ nullable: true })
  dateFin!: Date | null;

  @ApiProperty({ nullable: true })
  niveauBoost!: string | null;
}
