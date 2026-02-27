import { ApiProperty } from '@nestjs/swagger';

export class GarageResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  nom!: string;

  @ApiProperty()
  adresse!: string;

  @ApiProperty()
  telephone!: string;

  @ApiProperty({ nullable: true })
  email!: string | null;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ nullable: true })
  horairesOuverture!: string | null;

  @ApiProperty({ nullable: true })
  latitude!: number | null;

  @ApiProperty({ nullable: true })
  longitude!: number | null;

  @ApiProperty({ nullable: true })
  ville!: string | null;

  @ApiProperty({ nullable: true })
  pays!: string | null;

  @ApiProperty({ nullable: true })
  logoUrl!: string | null;

  @ApiProperty({ nullable: true })
  statutValidation!: string | null;

  @ApiProperty({ nullable: true })
  commentaireAdmin!: string | null;

  @ApiProperty({ nullable: true })
  dateValidation!: Date | null;

  @ApiProperty({ format: 'uuid', nullable: true })
  proprietaireId!: string | null;

  @ApiProperty({ nullable: true })
  proprietaireNom!: string | null;

  @ApiProperty({ nullable: true })
  createdAt!: Date | null;

  @ApiProperty({ nullable: true })
  updatedAt!: Date | null;

  @ApiProperty({ nullable: true })
  noteMoyenne!: number | null;

  @ApiProperty({ nullable: true })
  nombreAvis!: number | null;
}
