package com.sencarmarket.module.assurance.dto;

import com.sencarmarket.module.assurance.enums.StatutAssurance;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SouscriptionAssuranceResponse {

    private UUID id;
    private UUID utilisateurId;
    private String utilisateurNom;
    private UUID vehiculeId;
    private String vehiculeDescription;
    private UUID produitAssuranceId;
    private String produitAssuranceNom;
    private List<OptionAssuranceResponse> optionsSelectionnees;
    private BigDecimal montantTotal;
    private StatutAssurance statut;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private String numeroContrat;
    private String documentUrl;
    private UUID paiementId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
