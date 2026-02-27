import { ApiProperty } from '@nestjs/swagger';

export class DemandeTradeInResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  utilisateurId!: string;

  @ApiProperty({ nullable: true })
  utilisateurNom!: string | null;

  @ApiProperty({ format: 'uuid' })
  vehiculeActuelId!: string;

  @ApiProperty({ nullable: true })
  vehiculeActuelDescription!: string | null;

  @ApiProperty({ format: 'uuid', nullable: true })
  vehiculeSouhaiteId!: string | null;

  @ApiProperty({ nullable: true })
  vehiculeSouhaiteDescription!: string | null;

  @ApiProperty()
  statut!: string;

  @ApiProperty({ nullable: true })
  prixEstime!: number | null;

  @ApiProperty({ nullable: true })
  prixPropose!: number | null;

  @ApiProperty({ nullable: true })
  kilometrageActuel!: number | null;

  @ApiProperty({ nullable: true })
  etatVehicule!: string | null;

  @ApiProperty({ nullable: true })
  dateSoumission!: Date | null;

  @ApiProperty({ nullable: true })
  dateTraitement!: Date | null;

  @ApiProperty({ nullable: true })
  dateEvaluation!: Date | null;

  @ApiProperty({ nullable: true })
  motifRejet!: string | null;

  @ApiProperty({ nullable: true })
  commentaireAdmin!: string | null;

  @ApiProperty({ nullable: true })
  estNotifie!: boolean | null;

  @ApiProperty({ nullable: true })
  createdAt!: Date | null;

  @ApiProperty({ nullable: true })
  updatedAt!: Date | null;
}
