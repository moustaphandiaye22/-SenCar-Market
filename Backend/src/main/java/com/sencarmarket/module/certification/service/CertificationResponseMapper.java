package com.sencarmarket.module.certification.service;

import com.sencarmarket.module.certification.dto.DemandeCertificationResponse;
import com.sencarmarket.module.certification.dto.InspectionResponse;
import com.sencarmarket.module.certification.dto.RapportInspectionResponse;
import com.sencarmarket.module.certification.entity.DemandeCertification;
import com.sencarmarket.module.certification.entity.Inspection;
import com.sencarmarket.module.certification.entity.RapportInspection;
import org.springframework.stereotype.Service;

@Service
public class CertificationResponseMapper {

    public DemandeCertificationResponse toDemandeResponse(DemandeCertification demande) {
        return DemandeCertificationResponse.builder()
                .id(demande.getId())
                .utilisateurId(demande.getUtilisateur() != null ? demande.getUtilisateur().getId() : null)
                .utilisateurNom(demande.getUtilisateur() != null ? demande.getUtilisateur().getNom() : null)
                .vehiculeId(demande.getVehicule() != null ? demande.getVehicule().getId() : null)
                .vehiculeDescription(demande.getVehicule() != null
                        ? demande.getVehicule().getMarque() + " " + demande.getVehicule().getModele() : null)
                .statut(demande.getStatut())
                .montantPaiement(demande.getMontantPaiement())
                .paiementId(demande.getPaiementId())
                .inspecteurId(demande.getInspecteur() != null ? demande.getInspecteur().getId() : null)
                .inspecteurNom(demande.getInspecteur() != null ? demande.getInspecteur().getNom() : null)
                .dateSoumission(demande.getDateSoumission())
                .dateTraitement(demande.getDateTraitement())
                .dateInspection(demande.getDateInspection())
                .motifRejet(demande.getMotifRejet())
                .badgeCertifieUrl(demande.getBadgeCertifieUrl())
                .createdAt(demande.getCreatedAt())
                .updatedAt(demande.getUpdatedAt())
                .build();
    }

    public InspectionResponse toInspectionResponse(Inspection inspection) {
        return InspectionResponse.builder()
                .id(inspection.getId())
                .demandeCertificationId(inspection.getDemandeCertification() != null
                        ? inspection.getDemandeCertification().getId() : null)
                .inspecteurId(inspection.getInspecteur() != null ? inspection.getInspecteur().getId() : null)
                .inspecteurNom(inspection.getInspecteur() != null ? inspection.getInspecteur().getNom() : null)
                .dateInspection(inspection.getDateInspection())
                .resultat(inspection.getResultat())
                .commentaire(inspection.getCommentaire())
                .kilometrage(inspection.getKilometrage())
                .etatMoteur(inspection.getEtatMoteur())
                .etatGenerateur(inspection.getEtatGenerateur())
                .etatFreinage(inspection.getEtatFreinage())
                .etatSuspension(inspection.getEtatSuspension())
                .etatTransmission(inspection.getEtatTransmission())
                .etatPneus(inspection.getEtatPneus())
                .etatCarrosserie(inspection.getEtatCarrosserie())
                .etatInterieur(inspection.getEtatInterieur())
                .scoreTotal(inspection.getScoreTotal())
                .createdAt(inspection.getCreatedAt())
                .updatedAt(inspection.getUpdatedAt())
                .build();
    }

    public RapportInspectionResponse toRapportResponse(RapportInspection rapport) {
        return RapportInspectionResponse.builder()
                .id(rapport.getId())
                .inspectionId(rapport.getInspection() != null ? rapport.getInspection().getId() : null)
                .urlRapportPdf(rapport.getUrlRapportPdf())
                .dateGeneration(rapport.getDateGeneration())
                .scoreGlobale(rapport.getScoreGlobale())
                .recommendations(rapport.getRecommendations())
                .conclusion(rapport.getConclusion())
                .estApprouve(rapport.getEstApprouve())
                .createdAt(rapport.getCreatedAt())
                .updatedAt(rapport.getUpdatedAt())
                .build();
    }
}
