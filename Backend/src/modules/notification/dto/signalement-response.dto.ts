import { ApiProperty } from '@nestjs/swagger';

import {
  MotifSignalement,
  StatutTraitementSignalement,
  TypeEntiteSignalable,
} from '../types/notification.types';

export class SignalementResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  utilisateurId!: string;

  @ApiProperty({ nullable: true })
  utilisateurNom!: string | null;

  @ApiProperty({ enum: ['ANNONCE', 'UTILISATEUR', 'MESSAGE', 'AVIS', 'VEHICULE', 'COMMENTAIRE'] })
  typeEntite!: TypeEntiteSignalable;

  @ApiProperty({ format: 'uuid' })
  entiteId!: string;

  @ApiProperty({ enum: ['CONTENU_INAPPROPRIE', 'FAKE_ANNONCE', 'PRIX_TROMPEUR', 'HARCELEMENT', 'FRAUDE', 'ARNAQUE', 'PHOTO_TROMPEUSE', 'DESCRIPTION_INCORRECTE', 'VEHICULE_ENDOMMAGE', 'SPAM', 'MULTI_POST', 'AUTRE'] })
  motif!: MotifSignalement;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ enum: ['EN_ATTENTE', 'EN_COURS', 'TRAITE', 'REJETE', 'RESOLU'] })
  statutTraitement!: StatutTraitementSignalement;

  @ApiProperty({ nullable: true })
  actionAdmin!: string | null;

  @ApiProperty({ format: 'uuid', nullable: true })
  adminId!: string | null;

  @ApiProperty({ nullable: true })
  dateTraitement!: Date | null;

  @ApiProperty({ nullable: true })
  dateSignalement!: Date | null;
}
