import { Injectable } from "@nestjs/common";

import { toNullableNumber } from "../../../common/utils/number.util";
import {
  DemandeRecord,
  InspectionRecord,
  RapportRecord,
  VehiculeMini,
} from "../certification.models";
import { DemandeCertificationResponseDto } from "../dto/demande-certification-response.dto";
import { InspectionResponseDto } from "../dto/inspection-response.dto";
import { RapportInspectionResponseDto } from "../dto/rapport-inspection-response.dto";

@Injectable()
export class CertificationMapper {
  toDemandeResponse(demande: DemandeRecord): DemandeCertificationResponseDto {
    return {
      id: demande.id,
      utilisateurId: demande.utilisateur_id,
      utilisateurNom:
        demande.utilisateur_demande_certification_utilisateur_idToutilisateur
          ?.nom ?? null,
      vehiculeId: demande.vehicule_id,
      vehiculeDescription: this.vehiculeDescription(demande.vehicule),
      statut: demande.statut,
      montantPaiement: toNullableNumber(demande.montant_paiement),
      paiementId: demande.paiement_id,
      inspecteurId: demande.inspecteur_id,
      inspecteurNom:
        demande.utilisateur_demande_certification_inspecteur_idToutilisateur
          ?.nom ?? null,
      dateSoumission: demande.date_soumission,
      dateTraitement: demande.date_traitement,
      dateInspection: demande.date_inspection,
      motifRejet: demande.motif_rejet,
      badgeCertifieUrl: demande.badge_certifie_url,
      createdAt: demande.created_at,
      updatedAt: demande.updated_at,
    };
  }

  toInspectionResponse(inspection: InspectionRecord): InspectionResponseDto {
    return {
      id: inspection.id,
      demandeCertificationId: inspection.demande_certification_id,
      inspecteurId: inspection.utilisateur?.id ?? inspection.inspecteur_id,
      inspecteurNom: inspection.utilisateur?.nom ?? null,
      dateInspection: inspection.date_inspection,
      resultat: inspection.resultat,
      commentaire: inspection.commentaire,
      kilometrage: inspection.kilometrage,
      etatMoteur: inspection.etat_moteur,
      etatGenerateur: inspection.etat_generateur,
      etatFreinage: inspection.etat_freinage,
      etatSuspension: inspection.etat_suspension,
      etatTransmission: inspection.etat_transmission,
      etatPneus: inspection.etat_pneus,
      etatCarrosserie: inspection.etat_carrosserie,
      etatInterieur: inspection.etat_interieur,
      scoreTotal: inspection.score_total,
      createdAt: inspection.created_at,
      updatedAt: inspection.updated_at,
    };
  }

  toRapportResponse(rapport: RapportRecord): RapportInspectionResponseDto {
    return {
      id: rapport.id,
      inspectionId: rapport.inspection_id,
      urlRapportPdf: rapport.url_rapport_pdf,
      dateGeneration: rapport.date_generation,
      scoreGlobale: rapport.score_globale,
      recommendations: rapport.recommendations,
      conclusion: rapport.conclusion,
      estApprouve: rapport.est_approuve,
      createdAt: rapport.created_at,
      updatedAt: rapport.updated_at,
    };
  }

  private vehiculeDescription(vehicule: VehiculeMini): string | null {
    const desc =
      `${vehicule.marque?.nom ?? ""} ${vehicule.modele?.nom ?? ""}`.trim();
    return desc || null;
  }
}
