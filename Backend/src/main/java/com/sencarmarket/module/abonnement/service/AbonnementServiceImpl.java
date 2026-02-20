package com.sencarmarket.module.abonnement.service;

import com.sencarmarket.module.abonnement.dto.AbonnementResponse;
import com.sencarmarket.module.abonnement.dto.CreateAbonnementRequest;
import com.sencarmarket.module.abonnement.dto.SouscriptionRequest;
import com.sencarmarket.module.abonnement.dto.UtilisateurAbonnementResponse;
import com.sencarmarket.module.abonnement.entity.Abonnement;
import com.sencarmarket.module.abonnement.entity.BoostAnnonce;
import com.sencarmarket.module.abonnement.entity.UtilisateurAbonnement;
import com.sencarmarket.module.abonnement.enums.StatutAbonnement;
import com.sencarmarket.module.abonnement.repository.AbonnementRepository;
import com.sencarmarket.module.abonnement.repository.BoostAnnonceRepository;
import com.sencarmarket.module.abonnement.repository.UtilisateurAbonnementRepository;
import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.commun.exception.ResourceNotFoundException;
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

    private final AbonnementRepository abonnementRepository;
    private final UtilisateurAbonnementRepository utilisateurAbonnementRepository;
    private final BoostAnnonceRepository boostAnnonceRepository;

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
                .orElseThrow(() -> new ResourceNotFoundException("Abonnement non trouvé: " + id));

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
                .orElseThrow(() -> new ResourceNotFoundException("Abonnement non trouvé: " + id));

        // Désactiver au lieu de supprimer
        abonnement.setEstActif(false);
        abonnementRepository.save(abonnement);

        log.info("Plan d'abonnement {} désactivé", id);
    }

    @Override
    public AbonnementResponse getAbonnementById(UUID id) {
        Abonnement abonnement = abonnementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Abonnement non trouvé: " + id));
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
                .orElseThrow(() -> new ResourceNotFoundException("Abonnement non trouvé"));

        // Vérifier si l'utilisateur a déjà un abonnement actif
        var existingSub = utilisateurAbonnementRepository.findActiveSubscription(
                request.getUtilisateurId(), LocalDateTime.now());

        if (existingSub.isPresent()) {
            throw new IllegalStateException("L'utilisateur a déjà un abonnement actif");
        }

        // Créer la subscription
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime dateFin = now.plusDays(abonnement.getDureeJours());

        UtilisateurAbonnement subscription = UtilisateurAbonnement.builder()
                .utilisateurId(request.getUtilisateurId())
                .abonnementId(abonnement.getId())
                .dateDebut(now)
                .dateFin(dateFin)
                .statut(StatutAbonnement.ACTIF)
                .nombreAnnoncesUtilisees(0)
                .build();

        UtilisateurAbonnement saved = utilisateurAbonnementRepository.save(subscription);
        log.info("Souscription créée avec ID: {}", saved.getId());

        return UtilisateurAbonnementResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public UtilisateurAbonnementResponse renewSubscription(UUID utilisateurId) {
        log.info("Renouvellement de l'abonnement pour l'utilisateur: {}", utilisateurId);

        UtilisateurAbonnement subscription = utilisateurAbonnementRepository.findActiveSubscription(
                utilisateurId, LocalDateTime.now())
                .orElseThrow(() -> new ResourceNotFoundException("Aucun abonnement actif trouvé"));

        Abonnement abonnement = abonnementRepository.findById(subscription.getAbonnementId())
                .orElseThrow(() -> new ResourceNotFoundException("Abonnement non trouvé"));

        // Étendre la date de fin
        LocalDateTime newDateFin = subscription.getDateFin().plusDays(abonnement.getDureeJours());
        subscription.setDateFin(newDateFin);
        subscription.setStatut(StatutAbonnement.ACTIF);

        UtilisateurAbonnement saved = utilisateurAbonnementRepository.save(subscription);
        log.info("Abonnement renouvelé jusqu'au: {}", newDateFin);

        return UtilisateurAbonnementResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public void cancelSubscription(UUID utilisateurId) {
        log.info("Annulation de l'abonnement pour l'utilisateur: {}", utilisateurId);

        UtilisateurAbonnement subscription = utilisateurAbonnementRepository.findActiveSubscription(
                utilisateurId, LocalDateTime.now())
                .orElseThrow(() -> new ResourceNotFoundException("Aucun abonnement actif trouvé"));

        subscription.setStatut(StatutAbonnement.ANNULE);
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

        return PaginatedResponse.<UtilisateurAbonnementResponse>builder()
                .content(content)
                .page(subscriptionsPage.getNumber())
                .size(subscriptionsPage.getSize())
                .totalElements(subscriptionsPage.getTotalElements())
                .totalPages(subscriptionsPage.getTotalPages())
                .last(subscriptionsPage.isLast())
                .first(subscriptionsPage.isFirst())
                .build();
    }

    // ==================== BOOST ====================

    @Override
    @Transactional
    public BoostAnnonce createBoost(BoostAnnonce boost) {
        log.info("Création d'un boost pour l'annonce: {}", boost.getAnnonceLocationId());
        return boostAnnonceRepository.save(boost);
    }

    @Override
    @Transactional
    public BoostAnnonce updateBoost(UUID id, BoostAnnonce boost) {
        BoostAnnonce existingBoost = boostAnnonceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Boost non trouvé"));

        existingBoost.setDateDebut(boost.getDateDebut());
        existingBoost.setDateFin(boost.getDateFin());
        existingBoost.setNiveauBoost(boost.getNiveauBoost());

        return boostAnnonceRepository.save(existingBoost);
    }

    @Override
    @Transactional
    public void deleteBoost(UUID id) {
        log.info("Suppression du boost: {}", id);
        boostAnnonceRepository.deleteById(id);
    }

    @Override
    public BoostAnnonce getBoostById(UUID id) {
        return boostAnnonceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Boost non trouvé"));
    }

    @Override
    public List<BoostAnnonce> getBoostsByVehicule(UUID vehiculeId) {
        return boostAnnonceRepository.findByAnnonceLocationIdAndDateFinAfter(
                vehiculeId, LocalDateTime.now());
    }

    // ==================== EXPIRATION AUTOMATIQUE ====================

    /**
     * Méthode appelée par un scheduled task pour expirer les abonnements
     */
    @Transactional
    public void expireSubscriptions() {
        log.info("Vérification des abonnements expirés");

        List<UtilisateurAbonnement> expiredSubscriptions = utilisateurAbonnementRepository
                .findExpiredSubscriptions(LocalDateTime.now());

        for (UtilisateurAbonnement subscription : expiredSubscriptions) {
            subscription.setStatut(StatutAbonnement.EXPIRE);
            utilisateurAbonnementRepository.save(subscription);
            log.info("Abonnement {} expiré pour l'utilisateur {}", 
                    subscription.getId(), subscription.getUtilisateurId());
        }

        log.info("{} abonnements expirés", expiredSubscriptions.size());
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

                    int used = subscription.getNombreAnnoncesUtilisees() != null 
                            ? subscription.getNombreAnnoncesUtilisees() : 0;
                    int allowed = abonnement.getNombreAnnonces() != null 
                            ? abonnement.getNombreAnnonces() : 0;

                    return used < allowed;
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
                    int current = subscription.getNombreAnnoncesUtilisees() != null 
                            ? subscription.getNombreAnnoncesUtilisees() : 0;
                    subscription.setNombreAnnoncesUtilisees(current + 1);
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
                .orElseThrow(() -> new ResourceNotFoundException("Aucune subscription en attente"));
        
        // Activer l'abonnement
        subscription.setStatut(StatutAbonnement.ACTIF);
        
        // Calculer la date de fin
        Abonnement abonnement = abonnementRepository.findById(subscription.getAbonnementId())
                .orElseThrow(() -> new ResourceNotFoundException("Abonnement non trouvé"));
        
        subscription.setDateFin(LocalDateTime.now().plusDays(abonnement.getDureeJours()));
        
        UtilisateurAbonnement saved = utilisateurAbonnementRepository.save(subscription);
        log.info("Paiement confirmé, abonnement activé pour {}", utilisateurId);
        
        return UtilisateurAbonnementResponse.fromEntity(saved);
    }
}
