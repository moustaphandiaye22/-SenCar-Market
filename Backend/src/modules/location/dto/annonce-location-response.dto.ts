import { ApiProperty } from '@nestjs/swagger';

export class AnnonceLocationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  vehiculeId!: string | null;

  @ApiProperty()
  vehiculeMarque!: string | null;

  @ApiProperty()
  vehiculeModele!: string | null;

  @ApiProperty()
  vehiculePhoto!: string | null;

  @ApiProperty()
  proprietaireId!: string;

  @ApiProperty()
  proprietaireNom!: string | null;

  @ApiProperty()
  tarifJournalier!: string | null;

  @ApiProperty()
  description!: string | null;

  @ApiProperty()
  conditions!: string | null;

  @ApiProperty()
  caution!: string | null;

  @ApiProperty()
  kilometrageInclus!: number | null;

  @ApiProperty()
  tarifKmSupplementaire!: string | null;

  @ApiProperty()
  statut!: string | null;

  @ApiProperty()
  actif!: boolean | null;

  @ApiProperty()
  createdAt!: Date | null;

  @ApiProperty()
  updatedAt!: Date | null;
}
