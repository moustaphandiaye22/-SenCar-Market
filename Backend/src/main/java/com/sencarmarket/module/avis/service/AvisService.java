package com.sencarmarket.module.avis.service;

import com.sencarmarket.module.avis.dto.AvisResponse;
import com.sencarmarket.module.avis.dto.CreateAvisRequest;
import com.sencarmarket.module.commun.dto.PaginatedResponse;

import java.util.UUID;

/**
 * Interface pour le service avis
 */
public interface AvisService {

    /**
     * Créer un avis
     */
    AvisResponse createAvis(CreateAvisRequest request, UUID auteurId);

    /**
     * Obtenir un avis par ID
     */
    AvisResponse getAvisById(UUID avisId);

    /**
     * Obtenir les avis d'un utilisateur
     */
    PaginatedResponse<AvisResponse> getAvisByUtilisateur(UUID utilisateurId, int page, int size);

    /**
     * Obtenir les avis d'un véhicule
     */
    PaginatedResponse<AvisResponse> getAvisByVehicule(UUID vehiculeId, int page, int size);

    /**
     * Obtenir les avis d'un garage
     */
    PaginatedResponse<AvisResponse> getAvisByGarage(UUID garageId, int page, int size);

    /**
     * Obtenir la note moyenne d'un utilisateur
     */
    Double getNoteMoyenneUtilisateur(UUID utilisateurId);

    /**
     * Obtenir la note moyenne d'un véhicule
     */
    Double getNoteMoyenneVehicule(UUID vehiculeId);

    /**
     * Obtenir la note moyenne d'un garage
     */
    Double getNoteMoyenneGarage(UUID garageId);

    /**
     * Vérifier si une transaction est valide
     */
    boolean isTransactionValide(UUID transactionId, String typeAvis);

    /**
     * Signaler un avis
     */
    void signalerAvis(UUID avisId, UUID utilisateurId);

    /**
     * Supprimer un avis (admin ou auteur)
     */
    void deleteAvis(UUID avisId, UUID utilisateurId);
}
