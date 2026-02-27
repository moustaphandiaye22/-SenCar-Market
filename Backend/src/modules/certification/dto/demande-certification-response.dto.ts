import { ApiProperty } from '@nestjs/swagger';

export class DemandeCertificationResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  utilisateurId!: string;

  @ApiProperty({ nullable: true })
  utilisateurNom!: string | null;

  @ApiProperty({ format: 'uuid' })
  vehiculeId!: string;

  @ApiProperty({ nullable: true })
  vehiculeDescription!: string | null;

  @ApiProperty()
  statut!: string;

  @ApiProperty({ nullable: true })
  montantPaiement!: number | null;

  @ApiProperty({ format: 'uuid', nullable: true })
  paiementId!: string | null;

  @ApiProperty({ format: 'uuid', nullable: true })
  inspecteurId!: string | null;

  @ApiProperty({ nullable: true })
  inspecteurNom!: string | null;

  @ApiProperty({ nullable: true })
  dateSoumission!: Date | null;

  @ApiProperty({ nullable: true })
  dateTraitement!: Date | null;

  @ApiProperty({ nullable: true })
  dateInspection!: Date | null;

  @ApiProperty({ nullable: true })
  motifRejet!: string | null;

  @ApiProperty({ nullable: true })
  badgeCertifieUrl!: string | null;

  @ApiProperty({ nullable: true })
  createdAt!: Date | null;

  @ApiProperty({ nullable: true })
  updatedAt!: Date | null;
}
