import { ApiProperty } from '@nestjs/swagger';

import { TypeNotification } from '../types/notification.types';

export class NotificationResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  utilisateurId!: string;

  @ApiProperty()
  titre!: string;

  @ApiProperty({ nullable: true })
  message!: string | null;

  @ApiProperty({ enum: ['RESERVATION', 'RESERVATION_CONFIRMEE', 'RESERVATION_ANNULEE', 'RESERVATION_TERMINEE', 'PAIEMENT', 'PAIEMENT_RECU', 'PAIEMENT_ECHEC', 'RETRAIT', 'MESSAGE', 'NOUVEAU_MESSAGE', 'ABONNEMENT', 'SOUSCRIPTION_ACCEPTEE', 'SOUSCRIPTION_EXPIRE', 'ABONNEMENT_ACTIF', 'BOOST', 'BOOST_TERMINEE', 'BOOST_DEBUT', 'TRADE_IN', 'TRADE_IN_ACCEPTE', 'TRADE_IN_REJETE', 'CERTIFICATION', 'CERTIFICATION_APPROUVEE', 'CERTIFICATION_REJETEE', 'ASSURANCE', 'ASSURANCE_SOUSCRITE', 'ASSURANCE_EXPIRE', 'SYSTEM', 'MARKETING'] })
  type!: TypeNotification;

  @ApiProperty({ nullable: true })
  estLu!: boolean | null;

  @ApiProperty({ format: 'uuid', nullable: true })
  referenceId!: string | null;

  @ApiProperty({ nullable: true })
  referenceType!: string | null;

  @ApiProperty({ nullable: true })
  dateCreation!: Date | null;

  @ApiProperty({ nullable: true })
  dateLecture!: Date | null;
}
