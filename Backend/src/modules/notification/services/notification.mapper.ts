import { Injectable } from '@nestjs/common';

import { NotificationResponseDto } from '../dto/notification-response.dto';
import { SignalementResponseDto } from '../dto/signalement-response.dto';
import { NotificationRecord, SignalementRecord } from '../notification.models';

@Injectable()
export class NotificationMapper {
  toNotificationResponse(notification: NotificationRecord): NotificationResponseDto {
    return {
      id: notification.id,
      utilisateurId: notification.utilisateurId,
      titre: notification.titre,
      message: notification.message,
      type: notification.type,
      estLu: notification.estLu,
      referenceId: notification.referenceId,
      referenceType: notification.referenceType,
      dateCreation: notification.dateCreation,
      dateLecture: notification.dateLecture,
    };
  }

  toSignalementResponse(signalement: SignalementRecord): SignalementResponseDto {
    const nom = `${signalement.utilisateur?.prenom ?? ''} ${signalement.utilisateur?.nom ?? ''}`.trim();

    return {
      id: signalement.id,
      utilisateurId: signalement.utilisateurId,
      utilisateurNom: nom || null,
      typeEntite: signalement.typeEntite,
      entiteId: signalement.entiteId,
      motif: signalement.motif,
      description: signalement.description,
      statutTraitement: signalement.statutTraitement,
      actionAdmin: null,
      adminId: signalement.adminId,
      dateTraitement: signalement.dateTraitement,
      dateSignalement: signalement.dateSignalement,
    };
  }
}
