import { Injectable } from '@nestjs/common';

import { NotificationResponseDto } from '../dto/notification-response.dto';
import { SignalementResponseDto } from '../dto/signalement-response.dto';
import { NotificationRecord, SignalementRecord } from '../notification.models';

@Injectable()
export class NotificationMapper {
  toNotificationResponse(notification: NotificationRecord): NotificationResponseDto {
    return {
      id: notification.id,
      utilisateurId: notification.utilisateur_id,
      titre: notification.titre,
      message: notification.message,
      type: notification.type,
      estLu: notification.est_lu,
      referenceId: notification.reference_id,
      referenceType: notification.reference_type,
      dateCreation: notification.created_at,
      dateLecture: notification.date_lecture,
    };
  }

  toSignalementResponse(signalement: SignalementRecord): SignalementResponseDto {
    const nom = `${signalement.utilisateur?.prenom ?? ''} ${signalement.utilisateur?.nom ?? ''}`.trim();

    return {
      id: signalement.id,
      utilisateurId: signalement.utilisateur_id,
      utilisateurNom: nom || null,
      typeEntite: signalement.type_entite,
      entiteId: signalement.entite_id,
      motif: signalement.motif,
      description: signalement.description,
      statutTraitement: signalement.statut_traitement,
      actionAdmin: null,
      adminId: signalement.traite_par,
      dateTraitement: signalement.date_traitement,
      dateSignalement: signalement.created_at,
    };
  }
}
