package com.sencarmarket.module.abonnement.service;

import com.sencarmarket.module.abonnement.entity.Abonnement;
import com.sencarmarket.module.abonnement.entity.BoostAnnonce;
import com.sencarmarket.module.abonnement.entity.UtilisateurAbonnement;

import java.util.List;
import java.util.UUID;

/**
 * Interface pour le service abonnement
 * Implémente le principe de DIP (Dependency Inversion Principle)
 */
public interface IAbonnementService {

    // Abonnement
    Abonnement createAbonnement(Abonnement abonnement);

    Abonnement updateAbonnement(UUID id, Abonnement abonnement);

    void deleteAbonnement(UUID id);

    Abonnement getAbonnementById(UUID id);

    List<Abonnement> getAllAbonnements();

    // Utilisateur Abonnement
    UtilisateurAbonnement subscribe(UUID utilisateurId, UUID abonnementId);

    UtilisateurAbonnement renewSubscription(UUID utilisateurId);

    void cancelSubscription(UUID utilisateurId);

    UtilisateurAbonnement getActiveSubscription(UUID utilisateurId);

    List<UtilisateurAbonnement> getSubscriptionsByUtilisateur(UUID utilisateurId);

    // Boost
    BoostAnnonce createBoost(BoostAnnonce boost);

    BoostAnnonce updateBoost(UUID id, BoostAnnonce boost);

    void deleteBoost(UUID id);

    BoostAnnonce getBoostById(UUID id);

    List<BoostAnnonce> getBoostsByVehicule(UUID vehiculeId);
}
