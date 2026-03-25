import { ApiProperty } from '@nestjs/swagger';

export class RendezVousResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  garageId!: string;

  @ApiProperty()
  clientId!: string;

  @ApiProperty({ required: false })
  serviceId?: string;

  @ApiProperty()
  dateRendezVous!: Date;

  @ApiProperty()
  statut!: string;

  @ApiProperty({ required: false })
  commentaire?: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty()
  garageNom!: string;

  @ApiProperty()
  clientNom!: string;

  @ApiProperty({ required: false })
  serviceNom?: string;
}
