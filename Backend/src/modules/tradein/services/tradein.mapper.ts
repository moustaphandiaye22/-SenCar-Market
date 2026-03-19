import { Injectable } from '@nestjs/common';

import { toNullableNumber } from '../../../common/utils/number.util';
import { DemandeTradeInResponseDto } from '../dto/demande-tradein-response.dto';
import { DemandeRecord, VehiculeMini } from '../tradein.models';

@Injectable()
export class TradeInMapper {
  toDemandeResponse(demande: DemandeRecord): DemandeTradeInResponseDto {
    return {
      id: demande.id,
      utilisateurId: demande.utilisateur_id,
      utilisateurNom: demande.utilisateur?.nom ?? null,
      vehiculeActuelId: demande.vehicule_actuel_id,
      vehiculeActuelDescription: this.vehiculeDescription(demande.vehicule_actuel),
      vehiculeSouhaiteId: demande.vehicule_souhaite_id ?? null,
      vehiculeSouhaiteDescription: demande.vehicule_souhaite
        ? this.vehiculeDescription(demande.vehicule_souhaite)
        : null,
      statut: demande.statut,
      prixEstime: toNullableNumber(demande.prix_estime),
      prixPropose: toNullableNumber(demande.prix_propose),
      kilometrageActuel: demande.kilometrage_actuel ?? null,
      etatVehicule: demande.etat_vehicule ?? null,
      dateSoumission: demande.date_soumission ?? null,
      dateTraitement: demande.date_traitement ?? null,
      dateEvaluation: demande.date_evaluation ?? null,
      motifRejet: demande.motif_rejet ?? null,
      commentaireAdmin: demande.commentaire_admin ?? null,
      estNotifie: demande.est_notifie ?? false,
      createdAt: demande.created_at ?? null,
      updatedAt: demande.updated_at ?? null,
    };
  }

  private vehiculeDescription(vehicule: Pick<VehiculeMini, 'marque' | 'modele'>): string {
    const desc = `${vehicule.marque?.nom ?? ''} ${vehicule.modele?.nom ?? ''}`.trim();
    return desc || 'Vehicule';
  }
}
