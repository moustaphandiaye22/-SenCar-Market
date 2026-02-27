import { ApiProperty } from '@nestjs/swagger';

import { OptionAssuranceResponseDto } from './option-assurance-response.dto';

export class SouscriptionAssuranceResponseDto {
  @ApiProperty({ format: 'uuid', nullable: true })
  id!: string | null;

  @ApiProperty({ format: 'uuid', nullable: true })
  utilisateurId!: string | null;

  @ApiProperty({ nullable: true })
  utilisateurNom!: string | null;

  @ApiProperty({ format: 'uuid', nullable: true })
  vehiculeId!: string | null;

  @ApiProperty({ nullable: true })
  vehiculeDescription!: string | null;

  @ApiProperty({ format: 'uuid', nullable: true })
  produitAssuranceId!: string | null;

  @ApiProperty({ nullable: true })
  produitAssuranceNom!: string | null;

  @ApiProperty({ type: [OptionAssuranceResponseDto] })
  optionsSelectionnees!: OptionAssuranceResponseDto[];

  @ApiProperty({ nullable: true })
  montantTotal!: number | null;

  @ApiProperty({ nullable: true })
  statut!: string | null;

  @ApiProperty({ nullable: true })
  dateDebut!: Date | null;

  @ApiProperty({ nullable: true })
  dateFin!: Date | null;

  @ApiProperty({ nullable: true })
  numeroContrat!: string | null;

  @ApiProperty({ nullable: true })
  documentUrl!: string | null;

  @ApiProperty({ format: 'uuid', nullable: true })
  paiementId!: string | null;

  @ApiProperty({ nullable: true })
  createdAt!: Date | null;

  @ApiProperty({ nullable: true })
  updatedAt!: Date | null;
}
