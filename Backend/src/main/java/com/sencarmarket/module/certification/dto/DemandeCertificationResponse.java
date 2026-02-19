package com.sencarmarket.module.certification.dto;

import com.sencarmarket.module.certification.entity.DemandeCertification.StatutDemande;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemandeCertificationResponse {

    private UUID id;
    private UUID utilisateurId;
    private String utilisateurNom;
    private UUID vehiculeId;
    private String vehiculeDescription;
    private StatutDemande statut;
    private Double montantPaiement;
    private UUID paiementId;
    private UUID inspecteurId;
    private String inspecteurNom;
    private LocalDateTime dateSoumission;
    private LocalDateTime dateTraitement;
    private LocalDateTime dateInspection;
    private String motifRejet;
    private String badgeCertifieUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
