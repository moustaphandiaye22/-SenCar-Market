package com.sencarmarket.module.admin.service;

import com.sencarmarket.module.admin.dto.DashboardStatsResponse;
import com.sencarmarket.module.admin.dto.ModifierRoleRequest;
import com.sencarmarket.module.admin.mapper.AdminMapper;
import com.sencarmarket.module.commun.constants.AppMessages;
import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.commun.exception.InvalidOperationException;
import com.sencarmarket.module.commun.exception.ResourceNotFoundException;
import com.sencarmarket.module.commun.service.PaginationService;
import com.sencarmarket.module.paiement.dto.TransactionResponse;
import com.sencarmarket.module.paiement.entity.TransactionPortefeuille;
import com.sencarmarket.module.paiement.enums.StatutTransaction;
import com.sencarmarket.module.paiement.repository.TransactionPortefeuilleRepository;
import com.sencarmarket.module.utilisateur.dto.UtilisateurResponse;
import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.utilisateur.repository.UtilisateurRepository;
import com.sencarmarket.module.vehicule.dto.VehiculeResponse;
import com.sencarmarket.module.vehicule.entity.Statut;
import com.sencarmarket.module.vehicule.entity.Vehicule;
import com.sencarmarket.module.vehicule.repository.VehiculeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service Admin -_RESPONSIBILITY: Gestion des fonctionnalités administratives
 * Respecte SRP: Une seule responsabilité = logique métier admin
 * KISS: Méthodes simples et ciblées
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminServiceImpl implements IAdminService {

    // Dépendances - Injection par constructeur (SOLID: Dependency Inversion)
    private final UtilisateurRepository utilisateurRepository;
    private final VehiculeRepository vehiculeRepository;
    private final TransactionPortefeuilleRepository transactionRepository;
    private final AdminMapper adminMapper;
    private final AdminMetricsService adminMetricsService;
    private final AdminNotificationService adminNotificationService;
    private final PaginationService paginationService;

    // ==================== DASHBOARD ====================
    // KISS: Une méthode = une responsabilité

    @Override
    public DashboardStatsResponse getDashboardStats() {
        log.info("Récupération des statistiques du dashboard");
        return adminMetricsService.getDashboardStats();
    }

    // ==================== GESTION UTILISATEURS ====================

    @Override
    public PaginatedResponse<UtilisateurResponse> getAllUtilisateurs(Pageable pageable) {
        Page<Utilisateur> utilisateursPage = utilisateurRepository.findAll(pageable);

        List<UtilisateurResponse> content = utilisateursPage.getContent().stream()
                .map(adminMapper::toUtilisateurResponse)  // DRY: Utilisation du mapper
                .collect(Collectors.toList());

        return paginationService.build(utilisateursPage, content);
    }

    @Override
    public UtilisateurResponse getUtilisateurById(UUID utilisateurId) {
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "id", utilisateurId));
        return adminMapper.toUtilisateurResponse(utilisateur);
    }

    @Override
    @Transactional
    public UtilisateurResponse suspendreUtilisateur(UUID utilisateurId, String raison) {
        log.info("Suspension de l'utilisateur: {}", utilisateurId);

        Utilisateur utilisateur = getUtilisateurOrThrow(utilisateurId);
        utilisateur.setDeletedAt(LocalDateTime.now());
        Utilisateur saved = utilisateurRepository.save(utilisateur);

        adminNotificationService.notifyUtilisateur(utilisateurId, "SUSPENSION",
                "Votre compte a été suspendu. Raison: " + raison);

        log.info("Utilisateur {} suspendu", utilisateurId);
        return adminMapper.toUtilisateurResponse(saved);
    }

    @Override
    @Transactional
    public UtilisateurResponse reactivaterUtilisateur(UUID utilisateurId) {
        log.info("Réactivation de l'utilisateur: {}", utilisateurId);

        Utilisateur utilisateur = getUtilisateurOrThrow(utilisateurId);
        utilisateur.setDeletedAt(null);
        Utilisateur saved = utilisateurRepository.save(utilisateur);

        adminNotificationService.notifyUtilisateur(utilisateurId, "REACTIVATION",
                "Votre compte a été réactivé.");

        log.info("Utilisateur {} réactivé", utilisateurId);
        return adminMapper.toUtilisateurResponse(saved);
    }

    @Override
    @Transactional
    public void bannirUtilisateur(UUID utilisateurId, String raison) {
        log.info("Bannissement de l'utilisateur: {}", utilisateurId);

        Utilisateur utilisateur = getUtilisateurOrThrow(utilisateurId);
        utilisateur.setDeletedAt(LocalDateTime.now().plusYears(100));
        utilisateurRepository.save(utilisateur);

        adminNotificationService.notifyUtilisateur(utilisateurId, "BAN",
                "Votre compte a été banni. Raison: " + raison);

        log.info("Utilisateur {} banni", utilisateurId);
    }

    @Override
    @Transactional
    public UtilisateurResponse modifierRole(UUID utilisateurId, ModifierRoleRequest request) {
        log.info("Modification du rôle de l'utilisateur {} vers {}", utilisateurId, request.getNouveauRole());

        Utilisateur utilisateur = getUtilisateurOrThrow(utilisateurId);
        String ancienRole = utilisateur.getTypeUtilisateur() != null 
                ? utilisateur.getTypeUtilisateur().getNom() 
                : "null";
        
        utilisateur.setTypeUtilisateur(request.getNouveauRole());
        Utilisateur saved = utilisateurRepository.save(utilisateur);

        adminNotificationService.notifyUtilisateur(utilisateurId, "MODIFICATION_ROLE",
                "Votre rôle a été modifié de " + ancienRole + " vers " + request.getNouveauRole().getNom());

        return adminMapper.toUtilisateurResponse(saved);
    }

    // ==================== GESTION ANNONCES ====================

    @Override
    public PaginatedResponse<VehiculeResponse> getAllAnnonces(Pageable pageable) {
        Page<Vehicule> vehiculesPage = vehiculeRepository.findAll(pageable);

        List<VehiculeResponse> content = vehiculesPage.getContent().stream()
                .map(adminMapper::toVehiculeResponse)  // DRY
                .collect(Collectors.toList());

        return paginationService.build(vehiculesPage, content);
    }

    @Override
    @Transactional
    public VehiculeResponse validerAnnonce(UUID annonceId) {
        log.info("Validation de l'annonce: {}", annonceId);

        Vehicule vehicule = getVehiculeOrThrow(annonceId);
        vehicule.setStatut(Statut.PUBLIE);
        Vehicule saved = vehiculeRepository.save(vehicule);

        log.info("Annonce {} validée", annonceId);
        return adminMapper.toVehiculeResponse(saved);
    }

    @Override
    @Transactional
    public VehiculeResponse desactiverAnnonce(UUID annonceId, String raison) {
        log.info("Désactivation de l'annonce: {}", annonceId);

        Vehicule vehicule = getVehiculeOrThrow(annonceId);
        vehicule.setStatut(Statut.SUPPRIME);
        Vehicule saved = vehiculeRepository.save(vehicule);

        notifierVendeur(vehicule, "ANNONCE_DESACTIVEE",
                "Votre annonce a été désactivée. Raison: " + raison);

        return adminMapper.toVehiculeResponse(saved);
    }

    @Override
    @Transactional
    public void supprimerAnnonce(UUID annonceId) {
        log.info("Suppression de l'annonce: {}", annonceId);

        Vehicule vehicule = getVehiculeOrThrow(annonceId);
        notifierVendeur(vehicule, "ANNONCE_SUPPRIMEE",
                "Votre annonce a été supprimée par l'administrateur.");

        vehiculeRepository.delete(vehicule);
        log.info("Annonce {} supprimée", annonceId);
    }

    // ==================== GESTION PAIEMENTS ====================

    @Override
    public PaginatedResponse<TransactionResponse> getAllTransactions(Pageable pageable) {
        Page<TransactionPortefeuille> transactionsPage = transactionRepository.findAll(pageable);

        List<TransactionResponse> content = transactionsPage.getContent().stream()
                .map(adminMapper::toTransactionResponse)  // DRY
                .collect(Collectors.toList());

        return paginationService.build(transactionsPage, content);
    }

    @Override
    public PaginatedResponse<TransactionResponse> getTransactionsByUtilisateur(UUID utilisateurId, Pageable pageable) {
        List<TransactionPortefeuille> userTransactions =
                transactionRepository.findByPortefeuilleUtilisateurIdOrderByDateTransactionDesc(utilisateurId);
        
        return paginerTransactions(userTransactions, pageable);
    }

    @Override
    public double getTotalCommissions() {
        log.info("Calcul des commissions totales");
        return adminMetricsService.getTotalCommissions();
    }

    @Override
    @Transactional
    public TransactionResponse effectuerRemboursement(UUID transactionId, String raison) {
        log.info("Remboursement de la transaction: {}", transactionId);

        TransactionPortefeuille transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException(AppMessages.TRANSACTION_NOT_FOUND));

        if (transaction.getStatut() != StatutTransaction.CONFIRMEE) {
            throw new InvalidOperationException(AppMessages.PAIEMENT_REFUND_ONLY_CONFIRMED);
        }

        UUID portefeuilleId = transaction.getPortefeuille() != null 
                ? transaction.getPortefeuille().getId() 
                : null;

        TransactionPortefeuille remboursement = TransactionPortefeuille.builder()
                .portefeuille(transaction.getPortefeuille())
                .montant(transaction.getMontant() != null ? transaction.getMontant().negate() : null)
                .typeTransaction(transaction.getTypeTransaction())
                .statut(StatutTransaction.CONFIRMEE)
                .description("Remboursement pour transaction " + transactionId + ". Raison: " + raison)
                .build();

        TransactionPortefeuille saved = transactionRepository.save(remboursement);

        if (portefeuilleId != null) {
            adminNotificationService.notifyPaiement(portefeuilleId,
                    "Votre remboursement de " + transaction.getMontant() + " a été traité.");
        }

        return adminMapper.toTransactionResponse(saved);
    }

    // ==================== NOTIFICATIONS ====================

    @Override
    @Transactional
    public void notifierTousUtilisateurs(String titre, String message) {
        log.info("Envoi de notification à tous les utilisateurs");

        List<Utilisateur> utilisateurs = utilisateurRepository.findAll();
        adminNotificationService.notifyAll(utilisateurs, message);
        log.info("Notification envoyée à {} utilisateurs", utilisateurs.size());
    }

    @Override
    @Transactional
    public void notifierGroupeUtilisateurs(List<UUID> utilisateurIds, String titre, String message) {
        log.info("Envoi de notification à {} utilisateurs", utilisateurIds.size());

        adminNotificationService.notifyGroup(utilisateurIds, message);
    }

    // ==================== MÉTHODES PRIVÉES - KISS ====================

    /**
     * Récupère un utilisateur ou throw une exception - DRY
     */
    private Utilisateur getUtilisateurOrThrow(UUID id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppMessages.USER_NOT_FOUND));
    }

    /**
     * Récupère un véhicule ou throw une exception - DRY
     */
    private Vehicule getVehiculeOrThrow(UUID id) {
        return vehiculeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppMessages.ANNONCE_NOT_FOUND));
    }

    private void notifierVendeur(Vehicule vehicule, String type, String message) {
        if (vehicule.getProprietaire() != null) {
            adminNotificationService.notifyVendeurIfPresent(vehicule.getProprietaire().getId(), type, message);
        }
    }

    /**
     * Paginer les transactions - KISS
     */
    private PaginatedResponse<TransactionResponse> paginerTransactions(
            List<TransactionPortefeuille> transactions, Pageable pageable) {
        
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), transactions.size());
        List<TransactionPortefeuille> pageContent = start < transactions.size() 
                ? transactions.subList(start, end) 
                : List.of();

        List<TransactionResponse> content = pageContent.stream()
                .map(adminMapper::toTransactionResponse)
                .collect(Collectors.toList());

        Page<TransactionResponse> syntheticPage = new org.springframework.data.domain.PageImpl<>(
                content, pageable, transactions.size());
        return paginationService.build(syntheticPage, content);
    }
}
