package com.sencarmarket.module.notification.service;

import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.notification.dto.CreateSignalementRequest;
import com.sencarmarket.module.notification.dto.SignalementResponse;
import com.sencarmarket.module.notification.entity.Signalement;
import com.sencarmarket.module.notification.enums.StatutTraitementSignalement;
import com.sencarmarket.module.notification.enums.TypeEntiteSignalable;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

/**
 * Interface pour le service de modération (Module 11 - Signalements)
 */
public interface ISignalementService {

    /**
     * Crée un nouveau signalement
     */
    Signalement createSignalement(CreateSignalementRequest request);

    /**
     * Récupère un signalement par son ID
     */
    Signalement getSignalementById(UUID id);

    /**
     * Récupère tous les signalements avec pagination
     */
    PaginatedResponse<SignalementResponse> getAllSignalements(Pageable pageable);

    /**
     * Récupère les signalements par statut
     */
    PaginatedResponse<SignalementResponse> getSignalementsByStatut(StatutTraitementSignalement statut, Pageable pageable);

    /**
     * Récupère les signalements par type d'entité
     */
    PaginatedResponse<SignalementResponse> getSignalementsByTypeEntite(TypeEntiteSignalable typeEntite, Pageable pageable);

    /**
     * Récupère les signalements en attente
     */
    PaginatedResponse<SignalementResponse> getPendingSignalements(Pageable pageable);

    /**
     * Traite un signalement (action admin)
     */
    Signalement traiterSignalement(UUID id, String actionAdmin, UUID adminId);

    /**
     * Récupère les signalements d'un utilisateur
     */
    List<Signalement> getSignalementsByUtilisateur(UUID utilisateurId);

    /**
     * Compte les signalements en attente
     */
    long countPendingSignalements();
}
