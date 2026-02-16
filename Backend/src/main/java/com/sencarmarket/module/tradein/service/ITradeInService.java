package com.sencarmarket.module.tradein.service;

import com.sencarmarket.module.tradein.entity.DemandeTradeIn;

import java.util.List;
import java.util.UUID;

/**
 * Interface pour le service trade-in
 * Implémente le principe de DIP (Dependency Inversion Principle)
 */
public interface ITradeInService {

    DemandeTradeIn createDemande(DemandeTradeIn demande);

    DemandeTradeIn updateStatutDemande(UUID id, String nouveauStatut);

    DemandeTradeIn updateEvaluation(UUID id, double nouvelleEvaluation);

    void deleteDemande(UUID id);

    DemandeTradeIn getDemandeById(UUID id);

    List<DemandeTradeIn> getAllDemandes();

    List<DemandeTradeIn> getDemandesByUtilisateur(UUID utilisateurId);

    List<DemandeTradeIn> getDemandesEnAttente();

    List<DemandeTradeIn> getDemandesAcceptees();
}
