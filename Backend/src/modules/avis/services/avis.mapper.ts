import { Injectable } from '@nestjs/common';

import { AvisRecord } from '../avis.models';
import { AvisResponseDto } from '../dto/avis-response.dto';

@Injectable()
export class AvisMapper {
  toAvisResponse(avis: AvisRecord): AvisResponseDto {
    return {
      id: avis.id,
      auteurId: avis.auteurId,
      auteurNom: avis.auteur.nom,
      auteurPrenom: avis.auteur.prenom,
      cibleUtilisateurId: avis.cibleUtilisateurId,
      vehiculeId: avis.vehiculeId,
      garageId: avis.garageId,
      typeAvis: avis.typeAvis,
      transactionId: avis.transactionId,
      note: avis.note,
      commentaire: avis.commentaire,
      statut: avis.statut,
      createdAt: avis.createdAt,
    };
  }
}
