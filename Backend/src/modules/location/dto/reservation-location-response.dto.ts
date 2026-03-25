import { ApiProperty } from '@nestjs/swagger';

export class ReservationLocationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  annonceLocationId!: string;

  @ApiProperty()
  vehiculeMarque!: string | null;

  @ApiProperty()
  vehiculeModele!: string | null;

  @ApiProperty()
  vehiculePhoto!: string | null;

  @ApiProperty()
  locataireId!: string;

  @ApiProperty()
  locataireNom!: string | null;

  @ApiProperty()
  locataireEmail!: string | null;

  @ApiProperty()
  statut!: string | null;

  @ApiProperty()
  coutTotal!: string | null;

  @ApiProperty()
  caution!: string | null;

  @ApiProperty()
  dateDebut!: Date | null;

  @ApiProperty()
  dateFin!: Date | null;

  @ApiProperty()
  dateCreation!: Date | null;

  @ApiProperty()
  motifAnnulation!: string | null;

  @ApiProperty()
  paiementId!: string | null;

  @ApiProperty()
  paiementStatut!: string | null;
}
