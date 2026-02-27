import { Injectable } from '@nestjs/common';

import { toNullableNumber } from '../../../common/utils/number.util';
import { DemandeRecord, InspectionRecord, RapportRecord, VehiculeMini } from '../certification.models';
import { DemandeCertificationResponseDto } from '../dto/demande-certification-response.dto';
import { InspectionResponseDto } from '../dto/inspection-response.dto';
import { RapportInspectionResponseDto } from '../dto/rapport-inspection-response.dto';

@Injectable()
export class CertificationMapper {
  toDemandeResponse(demande: DemandeRecord): DemandeCertificationResponseDto {
    return {
      id: demande.id,
      utilisateurId: demande.utilisateurId,
      utilisateurNom: demande.utilisateur?.nom ?? null,
      vehiculeId: demande.vehiculeId,
      vehiculeDescription: this.vehiculeDescription(demande.vehicule),
      statut: demande.statut,
      montantPaiement: toNullableNumber(demande.montantPaiement),
      paiementId: demande.paiementId,
      inspecteurId: demande.inspecteurId,
      inspecteurNom: demande.inspecteur?.nom ?? null,
      dateSoumission: demande.dateSoumission,
      dateTraitement: demande.dateTraitement,
      dateInspection: demande.dateInspection,
      motifRejet: demande.motifRejet,
      badgeCertifieUrl: demande.badgeCertifieUrl,
      createdAt: demande.createdAt,
      updatedAt: demande.updatedAt,
    };
  }

  toInspectionResponse(inspection: InspectionRecord): InspectionResponseDto {
    return {
      id: inspection.id,
      demandeCertificationId: inspection.demandeCertificationId,
      inspecteurId: inspection.inspecteur?.id ?? inspection.inspecteurId,
      inspecteurNom: inspection.inspecteur?.nom ?? null,
      dateInspection: inspection.dateInspection,
      resultat: inspection.resultat,
      commentaire: inspection.commentaire,
      kilometrage: inspection.kilometrage,
      etatMoteur: inspection.etatMoteur,
      etatGenerateur: inspection.etatGenerateur,
      etatFreinage: inspection.etatFreinage,
      etatSuspension: inspection.etatSuspension,
      etatTransmission: inspection.etatTransmission,
      etatPneus: inspection.etatPneus,
      etatCarrosserie: inspection.etatCarrosserie,
      etatInterieur: inspection.etatInterieur,
      scoreTotal: inspection.scoreTotal,
      createdAt: inspection.createdAt,
      updatedAt: inspection.updatedAt,
    };
  }

  toRapportResponse(rapport: RapportRecord): RapportInspectionResponseDto {
    return {
      id: rapport.id,
      inspectionId: rapport.inspectionId,
      urlRapportPdf: rapport.urlRapportPdf,
      dateGeneration: rapport.dateGeneration,
      scoreGlobale: rapport.scoreGlobale,
      recommendations: rapport.recommendations,
      conclusion: rapport.conclusion,
      estApprouve: rapport.estApprouve,
      createdAt: rapport.createdAt,
      updatedAt: rapport.updatedAt,
    };
  }

  private vehiculeDescription(vehicule: VehiculeMini): string | null {
    const desc = `${vehicule.marque?.nom ?? ''} ${vehicule.modele?.nom ?? ''}`.trim();
    return desc || null;
  }
}
