package com.sencarmarket.module.tradein.dto;

import com.sencarmarket.module.tradein.entity.DemandeTradeIn.StatutTradeIn;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemandeTradeInResponse {

    private UUID id;
    private UUID utilisateurId;
    private String utilisateurNom;
    private UUID vehiculeActuelId;
    private String vehiculeActuelDescription;
    private UUID vehiculeSouhaiteId;
    private String vehiculeSouhaiteDescription;
    private StatutTradeIn statut;
    private BigDecimal prixEstime;
    private BigDecimal prixPropose;
    private Integer kilometrageActuel;
    private String etatVehicule;
    private LocalDateTime dateSoumission;
    private LocalDateTime dateTraitement;
    private LocalDateTime dateEvaluation;
    private String motifRejet;
    private String commentaireAdmin;
    private Boolean estNotifie;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
