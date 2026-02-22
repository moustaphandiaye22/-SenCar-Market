package com.sencarmarket.module.admin.service;

import com.sencarmarket.module.admin.dto.DashboardStatsResponse;
import com.sencarmarket.module.admin.dto.ModifierRoleRequest;
import com.sencarmarket.module.admin.mapper.AdminMapper;
import com.sencarmarket.module.abonnement.repository.UtilisateurAbonnementRepository;
import com.sencarmarket.module.annonce.repository.ReservationLocationRepository;
import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.commun.enums.StatutReservation;
import com.sencarmarket.module.commun.exception.ResourceNotFoundException;
import com.sencarmarket.module.notification.service.INotificationService;
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
    private final ReservationLocationRepository reservationRepository;
    private final UtilisateurAbonnementRepository utilisateurAbonnementRepository;
    private final INotificationService notificationService;
    private final AdminMapper adminMapper;

    // ==================== DASHBOARD ====================
    // KISS: Une méthode = une responsabilité

    @Override
    public DashboardStatsResponse getDashboardStats() {
        log.info("Récupération des statistiques du dashboard");

        // Utilisateurs
        long totalUtilisateurs = utilisateurRepository.count();
        
        // Annonces
        long totalAnnonces = vehiculeRepository.count();
        long totalAnnoncesActives = vehiculeRepository.countByStatut(Statut.PUBLIE);
        
        // Réservations
        long totalReservations = reservationRepository.count();
        long reservationsEnAttente = reservationRepository.countByStatut(StatutReservation.EN_ATTENTE);
        
        // Paiements
        long totalPaiements = transactionRepository.count();
        long paiementsEnAttente = transactionRepository.countByStatut(StatutTransaction.EN_ATTENTE);
        
        // Abonnements
        long abonnementsActifs = utilisateurAbonnementRepository.countActiveSubscriptions();
        long totalAbonnements = utilisateurAbonnementRepository.count();
        
        // Revenus (seul endroit où on charge des entités)
        double[] revenus = calculerRevenus();
        double revenusTotaux = revenus[0];
        double revenusCeMois = revenus[1];

        return DashboardStatsResponse.builder()
                .totalUtilisateurs(totalUtilisateurs)
                .totalAnnonces(totalAnnonces)
                .totalAnnoncesActives(totalAnnoncesActives)
                .totalReservations(totalReservations)
                .reservationsEnAttente(reservationsEnAttente)
                .revenusTotaux(revenusTotaux)
                .revenusCeMois(revenusCeMois)
                .totalPaiements(totalPaiements)
                .paiementsEnAttente(paiementsEnAttente)
                .totalAbonnements(totalAbonnements)
                .abonnementsActifs(abonnementsActifs)
                .build();
    }

    /**
     * Calcule les revenus - Méthode privée pour encapsulation (KISS)
     */
    private double[] calculerRevenus() {
        List<TransactionPortefeuille> transactionsConfirmees = transactionRepository
                .findByStatut(StatutTransaction.CONFIRMEE);
        
        double revenusTotaux = transactionsConfirmees.stream()
                .mapToDouble(t -> t.getMontant() != null ? t.getMontant().doubleValue() : 0)
                .sum();

        LocalDateTime debutMois = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0);
        double revenusCeMois = transactionsConfirmees.stream()
                .filter(t -> t.getDateTransaction() != null && t.getDateTransaction().isAfter(debutMois))
                .mapToDouble(t -> t.getMontant() != null ? t.getMontant().doubleValue() : 0)
                .sum();
        
        return new double[]{revenusTotaux, revenusCeMois};
    }

    // ==================== GESTION UTILISATEURS ====================

    @Override
    public PaginatedResponse<UtilisateurResponse> getAllUtilisateurs(Pageable pageable) {
        Page<Utilisateur> utilisateursPage = utilisateurRepository.findAll(pageable);

        List<UtilisateurResponse> content = utilisateursPage.getContent().stream()
                .map(adminMapper::toUtilisateurResponse)  // DRY: Utilisation du mapper
                .collect(Collectors.toList());

        return buildPaginatedResponse(utilisateursPage, content);
    }

    @Override
    public UtilisateurResponse getUtilisateurById(UUID utilisateurId) {
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé: " + utilisateurId));
        return adminMapper.toUtilisateurResponse(utilisateur);
    }

    @Override
    @Transactional
    public UtilisateurResponse suspendreUtilisateur(UUID utilisateurId, String raison) {
        log.info("Suspension de l'utilisateur: {}", utilisateurId);

        Utilisateur utilisateur = getUtilisateurOrThrow(utilisateurId);
        utilisateur.setDeletedAt(LocalDateTime.now());
        Utilisateur saved = utilisateurRepository.save(utilisateur);

        notificationService.notifierSubscription(utilisateurId, "SUSPENSION",
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

        notificationService.notifierSubscription(utilisateurId, "REACTIVATION",
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

        notificationService.notifierSubscription(utilisateurId, "BAN",
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

        notificationService.notifierSubscription(utilisateurId, "MODIFICATION_ROLE",
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

        return buildPaginatedResponse(vehiculesPage, content);
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

        return buildPaginatedResponse(transactionsPage, content);
    }

    @Override
    public PaginatedResponse<TransactionResponse> getTransactionsByUtilisateur(UUID utilisateurId, Pageable pageable) {
        List<TransactionPortefeuille> allTransactions = transactionRepository.findAll();
        List<TransactionPortefeuille> userTransactions = allTransactions.stream()
                .filter(t -> t.getPortefeuille() != null 
                        && t.getPortefeuille().getUtilisateur() != null 
                        && t.getPortefeuille().getUtilisateur().getId().equals(utilisateurId))
                .collect(Collectors.toList());
        
        return paginerTransactions(userTransactions, pageable);
    }

    @Override
    public double getTotalCommissions() {
        log.info("Calcul des commissions totales");

        return transactionRepository.findByStatut(StatutTransaction.CONFIRMEE).stream()
                .mapToDouble(t -> {
                    double montant = t.getMontant() != null ? t.getMontant().doubleValue() : 0;
                    return montant * 0.05;
                })
                .sum();
    }

    @Override
    @Transactional
    public TransactionResponse effectuerRemboursement(UUID transactionId, String raison) {
        log.info("Remboursement de la transaction: {}", transactionId);

        TransactionPortefeuille transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction non trouvée"));

        if (transaction.getStatut() == StatutTransaction.CONFIRMEE) {
            throw new IllegalStateException("Cette transaction ne peut pas être remboursée");
        }

        UUID portefeuilleId = transaction.getPortefeuille() != null 
                ? transaction.getPortefeuille().getId() 
                : null;

        TransactionPortefeuille remboursement = TransactionPortefeuille.builder()
                .montant(transaction.getMontant() != null ? transaction.getMontant().negate() : null)
                .typeTransaction(transaction.getTypeTransaction())
                .statut(StatutTransaction.CONFIRMEE)
                .description("Remboursement pour transaction " + transactionId + ". Raison: " + raison)
                .build();

        TransactionPortefeuille saved = transactionRepository.save(remboursement);

        if (portefeuilleId != null) {
            notificationService.notifierPaiement(portefeuilleId,
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
        utilisateurs.forEach(u -> 
                notificationService.notifierSubscription(u.getId(), "MESSAGE", message));

        log.info("Notification envoyée à {} utilisateurs", utilisateurs.size());
    }

    @Override
    @Transactional
    public void notifierGroupeUtilisateurs(List<UUID> utilisateurIds, String titre, String message) {
        log.info("Envoi de notification à {} utilisateurs", utilisateurIds.size());

        utilisateurIds.forEach(id -> 
                notificationService.notifierSubscription(id, "MESSAGE", message));
    }

    // ==================== MÉTHODES PRIVÉES - KISS ====================

    /**
     * Récupère un utilisateur ou throw une exception - DRY
     */
    private Utilisateur getUtilisateurOrThrow(UUID id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
    }

    /**
     * Récupère un véhicule ou throw une exception - DRY
     */
    private Vehicule getVehiculeOrThrow(UUID id) {
        return vehiculeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Annonce non trouvée"));
    }

    /**
     * Notifie le vendeur d'une annonce - DRY
     */
    private void notifierVendeur(Vehicule vehicule, String type, String message) {
        if (vehicule.getProprietaire() != null) {
            notificationService.notifierSubscription(vehicule.getProprietaire().getId(), type, message);
        }
    }

    /**
     * Construit une réponse paginée - DRY
     */
    private <T> PaginatedResponse<T> buildPaginatedResponse(Page<?> page, List<T> content) {
        return PaginatedResponse.<T>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .first(page.isFirst())
                .build();
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

        return PaginatedResponse.<TransactionResponse>builder()
                .content(content)
                .page(pageable.getPageNumber())
                .size(pageable.getPageSize())
                .totalElements(transactions.size())
                .totalPages((int) Math.ceil((double) transactions.size() / pageable.getPageSize()))
                .last(end >= transactions.size())
                .first(start == 0)
                .build();
    }
}
