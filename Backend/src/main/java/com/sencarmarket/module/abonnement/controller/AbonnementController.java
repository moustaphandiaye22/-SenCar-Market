package com.sencarmarket.module.abonnement.controller;

import com.sencarmarket.module.abonnement.dto.AbonnementResponse;
import com.sencarmarket.module.abonnement.dto.BoostAnnonceResponse;
import com.sencarmarket.module.abonnement.dto.CreateAbonnementRequest;
import com.sencarmarket.module.abonnement.dto.CreateBoostRequest;
import com.sencarmarket.module.abonnement.dto.SouscriptionRequest;
import com.sencarmarket.module.abonnement.dto.UtilisateurAbonnementResponse;
import com.sencarmarket.module.abonnement.service.IAbonnementService;
import com.sencarmarket.module.commun.constants.AppMessages;
import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.commun.security.AccessControlService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controleur REST pour la gestion des abonnements
 */
@RestController
@RequestMapping("/api/abonnements")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("isAuthenticated()")
public class AbonnementController {

    private final IAbonnementService abonnementService;
    private final AccessControlService accessControlService;

    // ==================== GESTION DES PLANS D'ABONNEMENT ====================

    /**
     * Creer un nouveau plan d'abonnement - Admin uniquement
     */
    @PostMapping("/plans")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AbonnementResponse> createPlan(@Valid @RequestBody CreateAbonnementRequest request) {
        log.info("Requete de creation d'un plan d'abonnement: {}", request.getNom());
        AbonnementResponse response = abonnementService.createAbonnement(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Mettre a jour un plan d'abonnement - Admin uniquement
     */
    @PutMapping("/plans/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AbonnementResponse> updatePlan(
            @PathVariable UUID id,
            @Valid @RequestBody CreateAbonnementRequest request) {
        log.info("Requete de mise a jour du plan d'abonnement: {}", id);
        AbonnementResponse response = abonnementService.updateAbonnement(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Supprimer (desactiver) un plan d'abonnement - Admin uniquement
     */
    @DeleteMapping("/plans/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePlan(@PathVariable UUID id) {
        log.info("Requete de suppression du plan d'abonnement: {}", id);
        abonnementService.deleteAbonnement(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Obtenir un plan d'abonnement par ID
     */
    @GetMapping("/plans/{id}")
    public ResponseEntity<AbonnementResponse> getPlanById(@PathVariable UUID id) {
        log.info("Requête de récupération du plan d'abonnement: {}", id);
        AbonnementResponse response = abonnementService.getAbonnementById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtenir tous les plans d'abonnement actifs
     */
    @GetMapping("/plans")
    public ResponseEntity<List<AbonnementResponse>> getAllPlans() {
        log.info("Requête de récupération de tous les plans d'abonnement");
        List<AbonnementResponse> response = abonnementService.getAllAbonnements();
        return ResponseEntity.ok(response);
    }

    // ==================== SOUSCRIPTION ====================

    /**
     * Souscrire à un plan d'abonnement
     */
    @PostMapping("/souscription")
    public ResponseEntity<UtilisateurAbonnementResponse> subscribe(
            @Valid @RequestBody SouscriptionRequest request,
            Authentication authentication) {
        applyAuthenticatedUtilisateurId(request, authentication);
        accessControlService.checkOwnerOrAdmin(authentication, request.getUtilisateurId(), AppMessages.ACCESS_DENIED_RESOURCE);
        log.info("Requête de souscription - Utilisateur: {}, Abonnement: {}", 
                request.getUtilisateurId(), request.getAbonnementId());
        UtilisateurAbonnementResponse response = abonnementService.subscribe(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Renouveler un abonnement
     */
    @PostMapping("/utilisateurs/{utilisateurId}/renew")
    public ResponseEntity<UtilisateurAbonnementResponse> renewSubscription(
            @PathVariable UUID utilisateurId,
            Authentication authentication) {
        accessControlService.checkOwnerOrAdmin(authentication, utilisateurId, AppMessages.ACCESS_DENIED_RESOURCE);
        log.info("Requête de renouvellement pour l'utilisateur: {}", utilisateurId);
        UtilisateurAbonnementResponse response = abonnementService.renewSubscription(utilisateurId);
        return ResponseEntity.ok(response);
    }

    /**
     * Annuler un abonnement
     */
    @PostMapping("/utilisateurs/{utilisateurId}/cancel")
    public ResponseEntity<Void> cancelSubscription(@PathVariable UUID utilisateurId, Authentication authentication) {
        accessControlService.checkOwnerOrAdmin(authentication, utilisateurId, AppMessages.ACCESS_DENIED_RESOURCE);
        log.info("Requête d'annulation pour l'utilisateur: {}", utilisateurId);
        abonnementService.cancelSubscription(utilisateurId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Obtenir l'abonnement actif d'un utilisateur
     */
    @GetMapping("/utilisateurs/{utilisateurId}/actif")
    public ResponseEntity<UtilisateurAbonnementResponse> getActiveSubscription(
            @PathVariable UUID utilisateurId,
            Authentication authentication) {
        accessControlService.checkOwnerOrAdmin(authentication, utilisateurId, AppMessages.ACCESS_DENIED_RESOURCE);
        log.info("Requête de récupération de l'abonnement actif pour: {}", utilisateurId);
        UtilisateurAbonnementResponse response = abonnementService.getActiveSubscription(utilisateurId);
        
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }

    /**
     * Obtenir l'historique des abonnements d'un utilisateur
     */
    @GetMapping("/utilisateurs/{utilisateurId}")
    public ResponseEntity<PaginatedResponse<UtilisateurAbonnementResponse>> getSubscriptionsHistory(
            @PathVariable UUID utilisateurId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        accessControlService.checkOwnerOrAdmin(authentication, utilisateurId, AppMessages.ACCESS_DENIED_RESOURCE);
        log.info("Requête de récupération de l'historique pour l'utilisateur: {}", utilisateurId);
        PaginatedResponse<UtilisateurAbonnementResponse> response = 
                abonnementService.getSubscriptionsByUtilisateur(utilisateurId, page, size);
        return ResponseEntity.ok(response);
    }

    // ==================== BOOST ====================

    /**
     * Créer un boost pour une annonce
     */
    @PostMapping("/boosts")
    public ResponseEntity<BoostAnnonceResponse> createBoost(@Valid @RequestBody CreateBoostRequest boost) {
        log.info("Requête de création d'un boost pour l'annonce: {}", boost.getAnnonceLocationId());
        BoostAnnonceResponse response = abonnementService.createBoost(boost);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Mettre à jour un boost
     */
    @PutMapping("/boosts/{id}")
    public ResponseEntity<BoostAnnonceResponse> updateBoost(
            @PathVariable UUID id,
            @Valid @RequestBody CreateBoostRequest boost) {
        log.info("Requête de mise à jour du boost: {}", id);
        BoostAnnonceResponse response = abonnementService.updateBoost(id, boost);
        return ResponseEntity.ok(response);
    }

    /**
     * Supprimer un boost
     */
    @DeleteMapping("/boosts/{id}")
    public ResponseEntity<Void> deleteBoost(@PathVariable UUID id) {
        log.info("Requête de suppression du boost: {}", id);
        abonnementService.deleteBoost(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Obtenir un boost par ID
     */
    @GetMapping("/boosts/{id}")
    public ResponseEntity<BoostAnnonceResponse> getBoostById(@PathVariable UUID id) {
        log.info("Requête de récupération du boost: {}", id);
        BoostAnnonceResponse response = abonnementService.getBoostById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtenir les boosts actifs pour un véhicule
     */
    @GetMapping("/vehicules/{vehiculeId}/boosts")
    public ResponseEntity<List<BoostAnnonceResponse>> getBoostsByVehicule(@PathVariable UUID vehiculeId) {
        log.info("Requête de récupération des boosts pour le véhicule: {}", vehiculeId);
        List<BoostAnnonceResponse> response = abonnementService.getBoostsByVehicule(vehiculeId);
        return ResponseEntity.ok(response);
    }

    private void applyAuthenticatedUtilisateurId(SouscriptionRequest request, Authentication authentication) {
        UUID currentUserId = accessControlService.getCurrentUserId(authentication);
        if (!accessControlService.isAdmin(authentication) || request.getUtilisateurId() == null) {
            request.setUtilisateurId(currentUserId);
        }
    }
}
