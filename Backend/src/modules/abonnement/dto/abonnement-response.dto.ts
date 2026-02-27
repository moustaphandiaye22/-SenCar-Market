import { ApiProperty } from '@nestjs/swagger';

import { TypeAbonnement } from '../types/abonnement.types';

export class AbonnementResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  nom!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ nullable: true })
  prixMensuel!: string | null;

  @ApiProperty({ nullable: true })
  dureeJours!: number | null;

  @ApiProperty({ nullable: true })
  nombreAnnonces!: number | null;

  @ApiProperty({ nullable: true })
  estVedette!: boolean | null;

  @ApiProperty({ nullable: true })
  estCertifie!: boolean | null;

  @ApiProperty({ enum: ['BASIC', 'PREMIUM', 'PROFESSIONNEL', 'ENTREPRISE'], nullable: true })
  type!: TypeAbonnement | null;
}
