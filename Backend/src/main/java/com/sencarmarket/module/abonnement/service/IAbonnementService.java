package com.sencarmarket.module.abonnement.service;

import com.sencarmarket.module.abonnement.dto.AbonnementResponse;
import com.sencarmarket.module.abonnement.dto.BoostAnnonceResponse;
import com.sencarmarket.module.abonnement.dto.CreateAbonnementRequest;
import com.sencarmarket.module.abonnement.dto.CreateBoostRequest;
import com.sencarmarket.module.abonnement.dto.SouscriptionRequest;
import com.sencarmarket.module.abonnement.dto.UtilisateurAbonnementResponse;
import com.sencarmarket.module.commun.dto.PaginatedResponse;

import java.util.List;
import java.util.UUID;

/**
 * Interface pour le service abonnement
 * Implémente le principe de DIP (Dependency Inversion Principle)
 */
public interface IAbonnementService {

    // ==================== PLANS D'ABONNEMENT ====================
    
    AbonnementResponse createAbonnement(CreateAbonnementRequest request);

    AbonnementResponse updateAbonnement(UUID id, CreateAbonnementRequest request);

    void deleteAbonnement(UUID id);

    AbonnementResponse getAbonnementById(UUID id);

    List<AbonnementResponse> getAllAbonnements();

    // ==================== SOUSCRIPTION ====================

    UtilisateurAbonnementResponse subscribe(SouscriptionRequest request);

    UtilisateurAbonnementResponse renewSubscription(UUID utilisateurId);

    void cancelSubscription(UUID utilisateurId);

    UtilisateurAbonnementResponse getActiveSubscription(UUID utilisateurId);

    PaginatedResponse<UtilisateurAbonnementResponse> getSubscriptionsByUtilisateur(UUID utilisateurId, int page, int size);

    // ==================== BOOST ====================

    BoostAnnonceResponse createBoost(CreateBoostRequest boost);

    BoostAnnonceResponse updateBoost(UUID id, CreateBoostRequest boost);

    void deleteBoost(UUID id);

    BoostAnnonceResponse getBoostById(UUID id);

    List<BoostAnnonceResponse> getBoostsByVehicule(UUID vehiculeId);

    // ==================== TÂCHE PLANIFIÉE ====================

    int notifierExpirationsProches();

    // ==================== PAIEMENT ====================

    UtilisateurAbonnementResponse confirmerPaiement(UUID utilisateurId, UUID paiementId);
}
