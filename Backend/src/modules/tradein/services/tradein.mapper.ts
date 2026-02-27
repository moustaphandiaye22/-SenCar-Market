import { Injectable } from '@nestjs/common';

import { toNullableNumber } from '../../../common/utils/number.util';
import { DemandeTradeInResponseDto } from '../dto/demande-tradein-response.dto';
import { DemandeRecord, VehiculeMini } from '../tradein.models';

@Injectable()
export class TradeInMapper {
  toDemandeResponse(demande: DemandeRecord): DemandeTradeInResponseDto {
    return {
      id: demande.id,
      utilisateurId: demande.utilisateurId,
      utilisateurNom: demande.utilisateur?.nom ?? null,
      vehiculeActuelId: demande.vehiculeActuelId,
      vehiculeActuelDescription: this.vehiculeDescription(demande.vehiculeActuel),
      vehiculeSouhaiteId: demande.vehiculeSouhaiteId,
      vehiculeSouhaiteDescription: demande.vehiculeSouhaite
        ? this.vehiculeDescription(demande.vehiculeSouhaite)
        : null,
      statut: demande.statut,
      prixEstime: toNullableNumber(demande.prixEstime),
      prixPropose: toNullableNumber(demande.prixPropose),
      kilometrageActuel: demande.kilometrageActuel,
      etatVehicule: demande.etatVehicule,
      dateSoumission: demande.dateSoumission,
      dateTraitement: demande.dateTraitement,
      dateEvaluation: demande.dateEvaluation,
      motifRejet: demande.motifRejet,
      commentaireAdmin: demande.commentaireAdmin,
      estNotifie: demande.estNotifie,
      createdAt: demande.createdAt,
      updatedAt: demande.updatedAt,
    };
  }

  private vehiculeDescription(vehicule: Pick<VehiculeMini, 'marque' | 'modele'>): string {
    const desc = `${vehicule.marque?.nom ?? ''} ${vehicule.modele?.nom ?? ''}`.trim();
    return desc || 'Vehicule';
  }
}
