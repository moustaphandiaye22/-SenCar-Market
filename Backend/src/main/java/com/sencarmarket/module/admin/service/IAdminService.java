package com.sencarmarket.module.admin.service;

import com.sencarmarket.module.admin.dto.DashboardStatsResponse;
import com.sencarmarket.module.admin.dto.ModifierRoleRequest;
import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.notification.dto.NotificationResponse;
import com.sencarmarket.module.paiement.dto.TransactionResponse;
import com.sencarmarket.module.utilisateur.dto.UtilisateurResponse;
import com.sencarmarket.module.vehicule.dto.VehiculeResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

/**
 * Interface pour le service admin
 */
public interface IAdminService {

    // ==================== DASHBOARD ====================

    /**
     * Obtenir les statistiques du dashboard
     */
    DashboardStatsResponse getDashboardStats();

    // ==================== GESTION UTILISATEURS ====================

    /**
     * Obtenir tous les utilisateurs avec pagination
     */
    PaginatedResponse<UtilisateurResponse> getAllUtilisateurs(Pageable pageable);

    /**
     * Obtenir un utilisateur par ID
     */
    UtilisateurResponse getUtilisateurById(UUID utilisateurId);

    /**
     * Suspendre un utilisateur
     */
    UtilisateurResponse suspendreUtilisateur(UUID utilisateurId, String raison);

    /**
     * Réactiver un utilisateur suspendu
     */
    UtilisateurResponse reactivaterUtilisateur(UUID utilisateurId);

    /**
     * Bannir un utilisateur définitivement
     */
    void bannirUtilisateur(UUID utilisateurId, String raison);

    /**
     * Modifier le rôle d'un utilisateur
     */
    UtilisateurResponse modifierRole(UUID utilisateurId, ModifierRoleRequest request);

    // ==================== GESTION ANNONCES ====================

    /**
     * Obtenir toutes les annonces avec pagination
     */
    PaginatedResponse<VehiculeResponse> getAllAnnonces(Pageable pageable);

    /**
     * Valider une annonce (pour les annonces qui nécessitent validation)
     */
    VehiculeResponse validerAnnonce(UUID annonceId);

    /**
     * Désactiver une annonce
     */
    VehiculeResponse desactiverAnnonce(UUID annonceId, String raison);

    /**
     * Supprimer une annonce
     */
    void supprimerAnnonce(UUID annonceId);

    // ==================== GESTION PAIEMENTS ====================

    /**
     * Obtenir toutes les transactions avec pagination
     */
    PaginatedResponse<TransactionResponse> getAllTransactions(Pageable pageable);

    /**
     * Obtenir les transactions d'un utilisateur
     */
    PaginatedResponse<TransactionResponse> getTransactionsByUtilisateur(UUID utilisateurId, Pageable pageable);

    /**
     * Calculer les commissions totales
     */
    double getTotalCommissions();

    /**
     * Effectuer un remboursement manuel
     */
    TransactionResponse effectuerRemboursement(UUID transactionId, String raison);

    // ==================== GESTION NOTIFICATIONS ====================

    /**
     * Envoyer une notification à tous les utilisateurs
     */
    void notifierTousUtilisateurs(String titre, String message);

    /**
     * Envoyer une notification à un groupe d'utilisateurs
     */
    void notifierGroupeUtilisateurs(java.util.List<UUID> utilisateurIds, String titre, String message);
}
