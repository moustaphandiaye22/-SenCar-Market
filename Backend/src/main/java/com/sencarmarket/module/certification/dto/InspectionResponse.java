package com.sencarmarket.module.certification.dto;

import com.sencarmarket.module.certification.entity.Inspection.ResultatInspection;
import com.sencarmarket.module.certification.entity.Inspection.etatVehicule;
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
public class InspectionResponse {

    private UUID id;
    private UUID demandeCertificationId;
    private UUID inspecteurId;
    private String inspecteurNom;
    private LocalDateTime dateInspection;
    private ResultatInspection resultat;
    private String commentaire;
    private Integer kilometrage;
    private etatVehicule etatMoteur;
    private etatVehicule etatGenerateur;
    private etatVehicule etatFreinage;
    private etatVehicule etatSuspension;
    private etatVehicule etatTransmission;
    private etatVehicule etatPneus;
    private etatVehicule etatCarrosserie;
    private etatVehicule etatInterieur;
    private Integer scoreTotal;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
