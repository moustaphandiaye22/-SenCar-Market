import { ApiProperty } from '@nestjs/swagger';

import { StatutAbonnement } from '../types/abonnement.types';

export class UtilisateurAbonnementResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  utilisateurId!: string;

  @ApiProperty({ format: 'uuid' })
  abonnementId!: string;

  @ApiProperty({ nullable: true })
  abonnementNom!: string | null;

  @ApiProperty({ nullable: true })
  dateDebut!: Date | null;

  @ApiProperty({ nullable: true })
  dateFin!: Date | null;

  @ApiProperty({ enum: ['ACTIF', 'EXPIRE', 'ANNULE', 'EN_ATTENTE'] })
  statut!: StatutAbonnement;

  @ApiProperty({ nullable: true })
  nombreAnnoncesUtilisees!: number | null;

  @ApiProperty({ nullable: true })
  nombreAnnoncesRestantes!: number | null;
}
