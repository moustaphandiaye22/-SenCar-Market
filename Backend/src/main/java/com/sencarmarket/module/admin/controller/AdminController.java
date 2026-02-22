package com.sencarmarket.module.admin.controller;

import com.sencarmarket.module.admin.dto.DashboardStatsResponse;
import com.sencarmarket.module.admin.dto.ModifierRoleRequest;
import com.sencarmarket.module.admin.service.IAdminService;
import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.paiement.dto.TransactionResponse;
import com.sencarmarket.module.utilisateur.dto.UtilisateurResponse;
import com.sencarmarket.module.vehicule.dto.VehiculeResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller pour les fonctionnalités admin
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final IAdminService adminService;

    // ==================== DASHBOARD ====================

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        log.info("Récupération des statistiques du dashboard");
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // ==================== GESTION UTILISATEURS ====================

    @GetMapping("/utilisateurs")
    public ResponseEntity<PaginatedResponse<UtilisateurResponse>> getAllUtilisateurs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("asc") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        log.info("Récupération de la liste des utilisateurs - page: {}, size: {}", page, size);
        return ResponseEntity.ok(adminService.getAllUtilisateurs(pageable));
    }

    @GetMapping("/utilisateurs/{utilisateurId}")
    public ResponseEntity<UtilisateurResponse> getUtilisateurById(@PathVariable UUID utilisateurId) {
        log.info("Récupération de l'utilisateur: {}", utilisateurId);
        return ResponseEntity.ok(adminService.getUtilisateurById(utilisateurId));
    }

    @PostMapping("/utilisateurs/{utilisateurId}/suspendre")
    public ResponseEntity<UtilisateurResponse> suspendreUtilisateur(
            @PathVariable UUID utilisateurId,
            @RequestParam String raison) {
        log.info("Suspension de l'utilisateur: {}", utilisateurId);
        return ResponseEntity.ok(adminService.suspendreUtilisateur(utilisateurId, raison));
    }

    @PostMapping("/utilisateurs/{utilisateurId}/reactiver")
    public ResponseEntity<UtilisateurResponse> reactiverUtilisateur(@PathVariable UUID utilisateurId) {
        log.info("Réactivation de l'utilisateur: {}", utilisateurId);
        return ResponseEntity.ok(adminService.reactivaterUtilisateur(utilisateurId));
    }

    @DeleteMapping("/utilisateurs/{utilisateurId}/ban")
    public ResponseEntity<Void> bannirUtilisateur(
            @PathVariable UUID utilisateurId,
            @RequestParam String raison) {
        log.info("Bannissement de l'utilisateur: {}", utilisateurId);
        adminService.bannirUtilisateur(utilisateurId, raison);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/utilisateurs/{utilisateurId}/role")
    public ResponseEntity<UtilisateurResponse> modifierRole(
            @PathVariable UUID utilisateurId,
            @Valid @RequestBody ModifierRoleRequest request) {
        log.info("Modification du rôle de l'utilisateur: {}", utilisateurId);
        return ResponseEntity.ok(adminService.modifierRole(utilisateurId, request));
    }

    // ==================== GESTION ANNONCES ====================

    @GetMapping("/annonces")
    public ResponseEntity<PaginatedResponse<VehiculeResponse>> getAllAnnonces(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("asc") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        log.info("Récupération de la liste des annonces - page: {}, size: {}", page, size);
        return ResponseEntity.ok(adminService.getAllAnnonces(pageable));
    }

    @PostMapping("/annonces/{annonceId}/valider")
    public ResponseEntity<VehiculeResponse> validerAnnonce(@PathVariable UUID annonceId) {
        log.info("Validation de l'annonce: {}", annonceId);
        return ResponseEntity.ok(adminService.validerAnnonce(annonceId));
    }

    @PostMapping("/annonces/{annonceId}/desactiver")
    public ResponseEntity<VehiculeResponse> desactiverAnnonce(
            @PathVariable UUID annonceId,
            @RequestParam String raison) {
        log.info("Désactivation de l'annonce: {}", annonceId);
        return ResponseEntity.ok(adminService.desactiverAnnonce(annonceId, raison));
    }

    @DeleteMapping("/annonces/{annonceId}")
    public ResponseEntity<Void> supprimerAnnonce(@PathVariable UUID annonceId) {
        log.info("Suppression de l'annonce: {}", annonceId);
        adminService.supprimerAnnonce(annonceId);
        return ResponseEntity.noContent().build();
    }

    // ==================== GESTION PAIEMENTS ====================

    @GetMapping("/transactions")
    public ResponseEntity<PaginatedResponse<TransactionResponse>> getAllTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("asc") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        log.info("Récupération de la liste des transactions - page: {}, size: {}", page, size);
        return ResponseEntity.ok(adminService.getAllTransactions(pageable));
    }

    @GetMapping("/utilisateurs/{utilisateurId}/transactions")
    public ResponseEntity<PaginatedResponse<TransactionResponse>> getTransactionsByUtilisateur(
            @PathVariable UUID utilisateurId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        log.info("Récupération des transactions de l'utilisateur: {}", utilisateurId);
        return ResponseEntity.ok(adminService.getTransactionsByUtilisateur(utilisateurId, pageable));
    }

    @GetMapping("/commissions")
    public ResponseEntity<Double> getTotalCommissions() {
        log.info("Récupération du total des commissions");
        return ResponseEntity.ok(adminService.getTotalCommissions());
    }

    @PostMapping("/transactions/{transactionId}/rembourser")
    public ResponseEntity<TransactionResponse> effectuerRemboursement(
            @PathVariable UUID transactionId,
            @RequestParam String raison) {
        log.info("Remboursement de la transaction: {}", transactionId);
        return ResponseEntity.ok(adminService.effectuerRemboursement(transactionId, raison));
    }

    // ==================== NOTIFICATIONS ====================

    @PostMapping("/notifications/broadcast")
    public ResponseEntity<Void> notifierTousUtilisateurs(
            @RequestParam String titre,
            @RequestParam String message) {
        log.info("Envoi de notification à tous les utilisateurs");
        adminService.notifierTousUtilisateurs(titre, message);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/notifications/groupe")
    public ResponseEntity<Void> notifierGroupeUtilisateurs(
            @RequestParam java.util.List<UUID> utilisateurIds,
            @RequestParam String titre,
            @RequestParam String message) {
        log.info("Envoi de notification à {} utilisateurs", utilisateurIds.size());
        adminService.notifierGroupeUtilisateurs(utilisateurIds, titre, message);
        return ResponseEntity.ok().build();
    }
}
