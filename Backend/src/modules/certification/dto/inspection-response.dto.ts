import { ApiProperty } from '@nestjs/swagger';

export class InspectionResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  demandeCertificationId!: string;

  @ApiProperty({ format: 'uuid', nullable: true })
  inspecteurId!: string | null;

  @ApiProperty({ nullable: true })
  inspecteurNom!: string | null;

  @ApiProperty({ nullable: true })
  dateInspection!: Date | null;

  @ApiProperty({ nullable: true })
  resultat!: string | null;

  @ApiProperty({ nullable: true })
  commentaire!: string | null;

  @ApiProperty({ nullable: true })
  kilometrage!: number | null;

  @ApiProperty({ nullable: true })
  etatMoteur!: string | null;

  @ApiProperty({ nullable: true })
  etatGenerateur!: string | null;

  @ApiProperty({ nullable: true })
  etatFreinage!: string | null;

  @ApiProperty({ nullable: true })
  etatSuspension!: string | null;

  @ApiProperty({ nullable: true })
  etatTransmission!: string | null;

  @ApiProperty({ nullable: true })
  etatPneus!: string | null;

  @ApiProperty({ nullable: true })
  etatCarrosserie!: string | null;

  @ApiProperty({ nullable: true })
  etatInterieur!: string | null;

  @ApiProperty({ nullable: true })
  scoreTotal!: number | null;

  @ApiProperty({ nullable: true })
  createdAt!: Date | null;

  @ApiProperty({ nullable: true })
  updatedAt!: Date | null;
}
