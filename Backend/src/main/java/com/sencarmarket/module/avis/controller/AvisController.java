package com.sencarmarket.module.avis.controller;

import com.sencarmarket.module.avis.dto.AvisResponse;
import com.sencarmarket.module.avis.dto.CreateAvisRequest;
import com.sencarmarket.module.avis.service.AvisService;
import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.commun.security.AccessControlService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controleur pour la gestion des avis
 */
@RestController
@RequestMapping("/api/avis")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class AvisController {

    private final AvisService avisService;
    private final AccessControlService accessControlService;

    /**
     * Creer un nouvel avis - Utilisateurs authentifies uniquement
     */
    @PostMapping
    public ResponseEntity<AvisResponse> createAvis(
            @Valid @RequestBody CreateAvisRequest request,
            Authentication authentication) {
        UUID utilisateurId = accessControlService.getCurrentUserId(authentication);
        AvisResponse response = avisService.createAvis(request, utilisateurId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Obtenir un avis par son ID
     */
    @GetMapping("/{avisId}")
    public ResponseEntity<AvisResponse> getAvisById(@PathVariable UUID avisId) {
        AvisResponse response = avisService.getAvisById(avisId);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtenir les avis sur un utilisateur
     */
    @GetMapping("/utilisateur/{utilisateurId}")
    public ResponseEntity<PaginatedResponse<AvisResponse>> getAvisByUtilisateur(
            @PathVariable UUID utilisateurId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PaginatedResponse<AvisResponse> response = avisService.getAvisByUtilisateur(utilisateurId, page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtenir les avis sur un véhicule
     */
    @GetMapping("/vehicule/{vehiculeId}")
    public ResponseEntity<PaginatedResponse<AvisResponse>> getAvisByVehicule(
            @PathVariable UUID vehiculeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PaginatedResponse<AvisResponse> response = avisService.getAvisByVehicule(vehiculeId, page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtenir les avis sur un garage
     */
    @GetMapping("/garage/{garageId}")
    public ResponseEntity<PaginatedResponse<AvisResponse>> getAvisByGarage(
            @PathVariable UUID garageId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PaginatedResponse<AvisResponse> response = avisService.getAvisByGarage(garageId, page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtenir la note moyenne d'un utilisateur
     */
    @GetMapping("/utilisateur/{utilisateurId}/moyenne")
    public ResponseEntity<Double> getNoteMoyenneUtilisateur(@PathVariable UUID utilisateurId) {
        Double moyenne = avisService.getNoteMoyenneUtilisateur(utilisateurId);
        return ResponseEntity.ok(moyenne);
    }

    /**
     * Obtenir la note moyenne d'un véhicule
     */
    @GetMapping("/vehicule/{vehiculeId}/moyenne")
    public ResponseEntity<Double> getNoteMoyenneVehicule(@PathVariable UUID vehiculeId) {
        Double moyenne = avisService.getNoteMoyenneVehicule(vehiculeId);
        return ResponseEntity.ok(moyenne);
    }

    /**
     * Obtenir la note moyenne d'un garage
     */
    @GetMapping("/garage/{garageId}/moyenne")
    public ResponseEntity<Double> getNoteMoyenneGarage(@PathVariable UUID garageId) {
        Double moyenne = avisService.getNoteMoyenneGarage(garageId);
        return ResponseEntity.ok(moyenne);
    }

    /**
     * Signaler un avis
     */
    @PostMapping("/{avisId}/signaler")
    public ResponseEntity<Void> signalerAvis(
            @PathVariable UUID avisId,
            Authentication authentication) {
        UUID utilisateurId = accessControlService.getCurrentUserId(authentication);
        avisService.signalerAvis(avisId, utilisateurId);
        return ResponseEntity.ok().build();
    }

    /**
     * Supprimer un avis
     */
    @DeleteMapping("/{avisId}")
    public ResponseEntity<Void> deleteAvis(
            @PathVariable UUID avisId,
            Authentication authentication) {
        UUID utilisateurId = accessControlService.getCurrentUserId(authentication);
        avisService.deleteAvis(avisId, utilisateurId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Vérifier si une transaction est valide pour laisser un avis
     */
    @GetMapping("/transaction/{transactionId}/validation")
    public ResponseEntity<Boolean> isTransactionValide(
            @PathVariable UUID transactionId,
            @RequestParam String typeAvis) {
        boolean valide = avisService.isTransactionValide(transactionId, typeAvis);
        return ResponseEntity.ok(valide);
    }

}
