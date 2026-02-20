package com.sencarmarket.module.tradein.service;

import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.tradein.dto.*;
import com.sencarmarket.module.tradein.entity.DemandeTradeIn;
import com.sencarmarket.module.tradein.entity.DemandeTradeIn.StatutTradeIn;

import java.util.List;
import java.util.UUID;

public interface TradeInService {

    // Demande
    DemandeTradeInResponse createDemande(CreateDemandeTradeInRequest request, UUID utilisateurId);
    DemandeTradeInResponse getDemandeById(UUID id);
    PaginatedResponse<DemandeTradeInResponse> getAllDemandes(int page, int size);
    List<DemandeTradeInResponse> getDemandesByUtilisateur(UUID utilisateurId);
    DemandeTradeInResponse updateDemande(UUID id, CreateDemandeTradeInRequest request);
    void deleteDemande(UUID id);

    // Estimation
    EstimationResponse estimerVehicule(EstimationRequest request);
    DemandeTradeInResponse calculerEstimationAuto(UUID demandeId);

    // Validation Admin
    DemandeTradeInResponse validerDemande(UUID id, ValidationRequest request);

    // Statut
    DemandeTradeInResponse updateStatut(UUID id, StatutTradeIn nouveauStatut);

    // Notifications
    DemandeTradeInResponse notifierUtilisateur(UUID id);
    List<DemandeTradeInResponse> getDemandesNonNotifiees();
}
