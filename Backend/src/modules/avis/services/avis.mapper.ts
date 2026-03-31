import { Injectable } from '@nestjs/common';

import { AvisRecord } from '../avis.models';
import { AvisResponseDto } from '../dto/avis-response.dto';

@Injectable()
export class AvisMapper {
  toAvisResponse(avis: AvisRecord): AvisResponseDto {
    return {
      id: avis.id,
      auteurId: avis.auteur_id,
      auteurNom: avis.auteur?.nom ?? null,
      auteurPrenom: avis.auteur?.prenom ?? null,
      cibleUtilisateurId: avis.cible_utilisateur_id ?? null,
      vehiculeId: avis.vehicule_id ?? null,
      garageId: avis.garage_id ?? null,
      typeAvis: avis.type_avis ?? null,
      transactionId: avis.transaction_id,
      note: avis.note,
      commentaire: avis.commentaire ?? null,
      statut: avis.statut ?? null,
      createdAt: avis.created_at ?? null,
    };
  }
}
