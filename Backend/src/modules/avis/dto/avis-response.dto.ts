import { ApiProperty } from '@nestjs/swagger';

export class AvisResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  auteurId!: string;

  @ApiProperty({ nullable: true })
  auteurNom!: string | null;

  @ApiProperty({ nullable: true })
  auteurPrenom!: string | null;

  @ApiProperty({ format: 'uuid', nullable: true })
  cibleUtilisateurId!: string | null;

  @ApiProperty({ format: 'uuid', nullable: true })
  vehiculeId!: string | null;

  @ApiProperty({ format: 'uuid', nullable: true })
  garageId!: string | null;

  @ApiProperty({ nullable: true })
  typeAvis!: string | null;

  @ApiProperty({ format: 'uuid' })
  transactionId!: string;

  @ApiProperty()
  note!: number;

  @ApiProperty({ nullable: true })
  commentaire!: string | null;

  @ApiProperty({ nullable: true })
  statut!: string | null;

  @ApiProperty({ nullable: true })
  createdAt!: Date | null;
}
