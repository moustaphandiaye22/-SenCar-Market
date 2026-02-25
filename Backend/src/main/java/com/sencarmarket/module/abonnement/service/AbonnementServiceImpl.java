package com.sencarmarket.module.abonnement.service;

import com.sencarmarket.module.abonnement.dto.AbonnementResponse;
import com.sencarmarket.module.abonnement.dto.BoostAnnonceResponse;
import com.sencarmarket.module.abonnement.dto.CreateAbonnementRequest;
import com.sencarmarket.module.abonnement.dto.CreateBoostRequest;
import com.sencarmarket.module.abonnement.dto.SouscriptionRequest;
import com.sencarmarket.module.abonnement.dto.UtilisateurAbonnementResponse;
import com.sencarmarket.module.abonnement.entity.Abonnement;
import com.sencarmarket.module.abonnement.entity.BoostAnnonce;
import com.sencarmarket.module.abonnement.entity.UtilisateurAbonnement;
import com.sencarmarket.module.abonnement.enums.StatutAbonnement;
import com.sencarmarket.module.abonnement.repository.AbonnementRepository;
import com.sencarmarket.module.abonnement.repository.BoostAnnonceRepository;
import com.sencarmarket.module.abonnement.repository.UtilisateurAbonnementRepository;
import com.sencarmarket.module.commun.constants.AppMessages;
import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.commun.exception.InvalidOperationException;
import com.sencarmarket.module.commun.exception.ResourceNotFoundException;
import com.sencarmarket.module.commun.service.PaginationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implémentation du service d'abonnement
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AbonnementServiceImpl implements IAbonnementService {
    private static final String RESOURCE_ABONNEMENT = "Abonnement";
    private static final String RESOURCE_BOOST = "Boost";
    private static final String FIELD_ID = "id";

    private final AbonnementRepository abonnementRepository;
    private final UtilisateurAbonnementRepository utilisateurAbonnementRepository;
    private final BoostAnnonceRepository boostAnnonceRepository;
    private final SubscriptionLifecycleService subscriptionLifecycleService;
    private final PaginationService paginationService;

    // ==================== GESTION DES PLANS D'ABONNEMENT ====================

    @Override
    @Transactional
    public AbonnementResponse createAbonnement(CreateAbonnementRequest request) {
        log.info("Création d'un nouveau plan d'abonnement: {}", request.getNom());

        Abonnement abonnement = Abonnement.builder()
                .nom(request.getNom())
                .description(request.getDescription())
                .prixMensuel(request.getPrixMensuel())
                .dureeJours(request.getDureeJours())
                .nombreAnnonces(request.getNombreAnnonces())
                .estVedette(request.getEstVedette() != null ? request.getEstVedette() : false)
                .estCertifie(request.getEstCertifie() != null ? request.getEstCertifie() : false)
                .type(request.getType())
                .estActif(true)
                .build();

        Abonnement saved = abonnementRepository.save(abonnement);
        log.info("Plan d'abonnement créé avec ID: {}", saved.getId());

        return AbonnementResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public AbonnementResponse updateAbonnement(UUID id, CreateAbonnementRequest request) {
        log.info("Mise à jour du plan d'abonnement: {}", id);

        Abonnement abonnement = abonnementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_ABONNEMENT, FIELD_ID, id));

        abonnement.setNom(request.getNom());
        abonnement.setDescription(request.getDescription());
        abonnement.setPrixMensuel(request.getPrixMensuel());
        abonnement.setDureeJours(request.getDureeJours());
        abonnement.setNombreAnnonces(request.getNombreAnnonces());
        abonnement.setEstVedette(request.getEstVedette());
        abonnement.setEstCertifie(request.getEstCertifie());
        abonnement.setType(request.getType());

        Abonnement saved = abonnementRepository.save(abonnement);
        log.info("Plan d'abonnement {} mis à jour", id);

        return AbonnementResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public void deleteAbonnement(UUID id) {
        log.info("Suppression du plan d'abonnement: {}", id);

        Abonnement abonnement = abonnementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_ABONNEMENT, FIELD_ID, id));

        // Désactiver au lieu de supprimer
        abonnement.setEstActif(false);
        abonnementRepository.save(abonnement);

        log.info("Plan d'abonnement {} désactivé", id);
    }

    @Override
    public AbonnementResponse getAbonnementById(UUID id) {
        Abonnement abonnement = abonnementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_ABONNEMENT, FIELD_ID, id));
        return AbonnementResponse.fromEntity(abonnement);
    }

    @Override
    public List<AbonnementResponse> getAllAbonnements() {
        return abonnementRepository.findAll().stream()
                .filter(Abonnement::getEstActif)
                .map(AbonnementResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ==================== SOUSCRIPTION ====================

    @Override
    @Transactional
    public UtilisateurAbonnementResponse subscribe(SouscriptionRequest request) {
        log.info("Souscription à un abonnement - Utilisateur: {}, Abonnement: {}", 
                request.getUtilisateurId(), request.getAbonnementId());

        // Vérifier l'abonnement
        Abonnement abonnement = abonnementRepository.findById(request.getAbonnementId())
                .orElseThrow(() -> new ResourceNotFoundException(AppMessages.ABONNEMENT_NOT_FOUND));

        subscriptionLifecycleService.ensureNoActiveSubscription(request.getUtilisateurId());
        UtilisateurAbonnement subscription =
                subscriptionLifecycleService.createActiveSubscription(request.getUtilisateurId(), abonnement);

        UtilisateurAbonnement saved = utilisateurAbonnementRepository.save(subscription);
        log.info("Souscription créée avec ID: {}", saved.getId());

        return UtilisateurAbonnementResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public UtilisateurAbonnementResponse renewSubscription(UUID utilisateurId) {
        log.info("Renouvellement de l'abonnement pour l'utilisateur: {}", utilisateurId);

        UtilisateurAbonnement subscription = subscriptionLifecycleService.getActiveSubscriptionOrThrow(utilisateurId);

        Abonnement abonnement = abonnementRepository.findById(subscription.getAbonnementId())
                .orElseThrow(() -> new ResourceNotFoundException(AppMessages.ABONNEMENT_NOT_FOUND));

        subscriptionLifecycleService.renew(subscription, abonnement);

        UtilisateurAbonnement saved = utilisateurAbonnementRepository.save(subscription);
        log.info("Abonnement renouvelé jusqu'au: {}", saved.getDateFin());

        return UtilisateurAbonnementResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public void cancelSubscription(UUID utilisateurId) {
        log.info("Annulation de l'abonnement pour l'utilisateur: {}", utilisateurId);

        UtilisateurAbonnement subscription = subscriptionLifecycleService.getActiveSubscriptionOrThrow(utilisateurId);
        subscriptionLifecycleService.cancel(subscription);
        utilisateurAbonnementRepository.save(subscription);

        log.info("Abonnement annulé");
    }

    @Override
    public UtilisateurAbonnementResponse getActiveSubscription(UUID utilisateurId) {
        return utilisateurAbonnementRepository.findActiveSubscription(utilisateurId, LocalDateTime.now())
                .map(UtilisateurAbonnementResponse::fromEntity)
                .orElse(null);
    }

    @Override
    public PaginatedResponse<UtilisateurAbonnementResponse> getSubscriptionsByUtilisateur(UUID utilisateurId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateDebut").descending());
        Page<UtilisateurAbonnement> subscriptionsPage = utilisateurAbonnementRepository.findByUtilisateurId(utilisateurId, pageable);

        List<UtilisateurAbonnementResponse> content = subscriptionsPage.getContent().stream()
                .map(UtilisateurAbonnementResponse::fromEntity)
                .collect(Collectors.toList());

        return paginationService.build(subscriptionsPage, content);
    }

    // ==================== BOOST ====================

    @Override
    @Transactional
    public BoostAnnonceResponse createBoost(CreateBoostRequest boost) {
        log.info("Création d'un boost pour l'annonce: {}", boost.getAnnonceLocationId());
        BoostAnnonce entity = BoostAnnonce.builder()
                .annonceLocationId(boost.getAnnonceLocationId())
                .dateDebut(boost.getDateDebut())
                .dateFin(boost.getDateFin())
                .niveauBoost(boost.getNiveauBoost())
                .build();
        return BoostAnnonceResponse.fromEntity(boostAnnonceRepository.save(entity));
    }

    @Override
    @Transactional
    public BoostAnnonceResponse updateBoost(UUID id, CreateBoostRequest boost) {
        BoostAnnonce existingBoost = boostAnnonceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_BOOST, FIELD_ID, id));

        existingBoost.setDateDebut(boost.getDateDebut());
        existingBoost.setDateFin(boost.getDateFin());
        existingBoost.setNiveauBoost(boost.getNiveauBoost());

        return BoostAnnonceResponse.fromEntity(boostAnnonceRepository.save(existingBoost));
    }

    @Override
    @Transactional
    public void deleteBoost(UUID id) {
        log.info("Suppression du boost: {}", id);
        boostAnnonceRepository.deleteById(id);
    }

    @Override
    public BoostAnnonceResponse getBoostById(UUID id) {
        return boostAnnonceRepository.findById(id)
                .map(BoostAnnonceResponse::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_BOOST, FIELD_ID, id));
    }

    @Override
    public List<BoostAnnonceResponse> getBoostsByVehicule(UUID vehiculeId) {
        return boostAnnonceRepository.findByAnnonceLocationIdAndDateFinAfter(
                vehiculeId, LocalDateTime.now()).stream()
                .map(BoostAnnonceResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ==================== EXPIRATION AUTOMATIQUE ====================

    /**
     * Méthode appelée par un scheduled task pour expirer les abonnements
     */
    @Transactional
    public void expireSubscriptions() {
        log.info("Vérification des abonnements expirés");
        int expired = subscriptionLifecycleService.expireDueSubscriptions();
        log.info("{} abonnements expirés", expired);
    }

    /**
     * Vérifie si l'utilisateur peut poster une annonce
     */
    public boolean peutPosterAnnonce(UUID utilisateurId) {
        return utilisateurAbonnementRepository.findActiveSubscription(utilisateurId, LocalDateTime.now())
                .map(subscription -> {
                    Abonnement abonnement = abonnementRepository.findById(subscription.getAbonnementId())
                            .orElse(null);
                    if (abonnement == null) return false;
                    return subscriptionLifecycleService.canPostAnnonce(subscription, abonnement);
                })
                .orElse(false);
    }

    /**
     * Incrémente le nombre d'annonces utilisées
     */
    @Transactional
    public void incrementerAnnoncesUtilisees(UUID utilisateurId) {
        utilisateurAbonnementRepository.findActiveSubscription(utilisateurId, LocalDateTime.now())
                .ifPresent(subscription -> {
                    subscriptionLifecycleService.incrementUsedAnnonces(subscription);
                    utilisateurAbonnementRepository.save(subscription);
                });
    }

    // ==================== TÂCHE PLANIFIÉE ====================

    @Override
    public int notifierExpirationsProches() {
        log.info("Recherche des abonnements expirant dans les 7 prochains jours");
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime in7Days = now.plusDays(7);
        
        List<UtilisateurAbonnement> expiringSoon = utilisateurAbonnementRepository
                .findExpiringSoon(now, in7Days);
        
        int count = 0;
        for (UtilisateurAbonnement sub : expiringSoon) {
            // Ici on enverrait une notification
            log.info("Expiration imminente pour l'utilisateur {} - Date: {}", 
                    sub.getUtilisateurId(), sub.getDateFin());
            count++;
        }
        
        log.info("{} abonnements expirant bientôt", count);
        return count;
    }

    // ==================== PAIEMENT ====================

    @Override
    @Transactional
    public UtilisateurAbonnementResponse confirmerPaiement(UUID utilisateurId, UUID paiementId) {
        log.info("Confirmation du paiement {} pour l'utilisateur {}", paiementId, utilisateurId);
        
        // Rechercher la subscription en attente
        UtilisateurAbonnement subscription = utilisateurAbonnementRepository
                .findByUtilisateurIdAndStatut(utilisateurId, StatutAbonnement.EN_ATTENTE)
                .orElseThrow(() -> new ResourceNotFoundException(AppMessages.NO_PENDING_SUBSCRIPTION));
        
        // Activer l'abonnement
        subscription.setStatut(StatutAbonnement.ACTIF);
        
        // Calculer la date de fin
        Abonnement abonnement = abonnementRepository.findById(subscription.getAbonnementId())
                .orElseThrow(() -> new ResourceNotFoundException(AppMessages.ABONNEMENT_NOT_FOUND));
        
        subscription.setDateFin(LocalDateTime.now().plusDays(abonnement.getDureeJours()));
        
        UtilisateurAbonnement saved = utilisateurAbonnementRepository.save(subscription);
        log.info("Paiement confirmé, abonnement activé pour {}", utilisateurId);
        
        return UtilisateurAbonnementResponse.fromEntity(saved);
    }
}
