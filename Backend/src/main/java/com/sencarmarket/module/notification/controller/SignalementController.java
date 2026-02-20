package com.sencarmarket.module.notification.controller;

import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.notification.dto.ActionAdminRequest;
import com.sencarmarket.module.notification.dto.CreateSignalementRequest;
import com.sencarmarket.module.notification.dto.SignalementResponse;
import com.sencarmarket.module.notification.entity.Signalement;
import com.sencarmarket.module.notification.enums.StatutTraitementSignalement;
import com.sencarmarket.module.notification.enums.TypeEntiteSignalable;
import com.sencarmarket.module.notification.service.ISignalementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Contrôleur pour la modération (Module 11 - Signalements)
 * Endpoints pour gérer les signalements et les actions admin
 */
@RestController
@RequestMapping("/api/signalements")
@RequiredArgsConstructor
@Slf4j
public class SignalementController {

    private final ISignalementService signalementService;

    /**
     * Créer un nouveau signalement
     */
    @PostMapping
    public ResponseEntity<SignalementResponse> createSignalement(
            @Valid @RequestBody CreateSignalementRequest request) {
        log.info("Création d'un nouveau signalement - Type: {}", request.getTypeEntite());
        
        Signalement signalement = signalementService.createSignalement(request);
        SignalementResponse response = toResponse(signalement);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Récupérer un signalement par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<SignalementResponse> getSignalement(@PathVariable UUID id) {
        log.info("Récupération du signalement: {}", id);
        
        Signalement signalement = signalementService.getSignalementById(id);
        SignalementResponse response = toResponse(signalement);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Récupérer tous les signalements (pagination)
     */
    @GetMapping
    public ResponseEntity<PaginatedResponse<SignalementResponse>> getAllSignalements(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "dateSignalement") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        log.info("Récupération de tous les signalements - Page: {}, Size: {}", page, size);
        
        Sort sort = sortDir.equalsIgnoreCase("asc") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        PaginatedResponse<SignalementResponse> signalements = signalementService.getAllSignalements(pageable);
        
        return ResponseEntity.ok(signalements);
    }

    /**
     * Récupérer les signalements en attente (priorité admin)
     */
    @GetMapping("/pending")
    public ResponseEntity<PaginatedResponse<SignalementResponse>> getPendingSignalements(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("Récupération des signalements en attente");
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateSignalement").descending());
        PaginatedResponse<SignalementResponse> signalements = signalementService.getPendingSignalements(pageable);
        
        return ResponseEntity.ok(signalements);
    }

    /**
     * Filtrer les signalements par statut
     */
    @GetMapping("/statut/{statut}")
    public ResponseEntity<PaginatedResponse<SignalementResponse>> getSignalementsByStatut(
            @PathVariable StatutTraitementSignalement statut,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("Récupération des signalements par statut: {}", statut);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateSignalement").descending());
        PaginatedResponse<SignalementResponse> signalements = signalementService.getSignalementsByStatut(statut, pageable);
        
        return ResponseEntity.ok(signalements);
    }

    /**
     * Filtrer les signalements par type d'entité
     */
    @GetMapping("/type/{typeEntite}")
    public ResponseEntity<PaginatedResponse<SignalementResponse>> getSignalementsByType(
            @PathVariable TypeEntiteSignalable typeEntite,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("Récupération des signalements par type: {}", typeEntite);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateSignalement").descending());
        PaginatedResponse<SignalementResponse> signalements = signalementService.getSignalementsByTypeEntite(typeEntite, pageable);
        
        return ResponseEntity.ok(signalements);
    }

    /**
     * Traiter un signalement (action admin)
     */
    @PostMapping("/{id}/traiter")
    public ResponseEntity<SignalementResponse> traiterSignalement(
            @PathVariable UUID id,
            @Valid @RequestBody ActionAdminRequest request) {
        
        log.info("Traitement du signalement {} - Action: {}", id, request.getActionAdmin());
        
        Signalement signalement = signalementService.traiterSignalement(
                id, 
                request.getActionAdmin(), 
                request.getAdminId()
        );
        SignalementResponse response = toResponse(signalement);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Compter les signalements en attente
     */
    @GetMapping("/count/pending")
    public ResponseEntity<Map<String, Long>> countPending() {
        long count = signalementService.countPendingSignalements();
        
        Map<String, Long> response = new HashMap<>();
        response.put("pendingCount", count);
        
        return ResponseEntity.ok(response);
    }

    // ==================== HELPERS ====================

    private SignalementResponse toResponse(Signalement signalement) {
        return SignalementResponse.builder()
                .id(signalement.getId())
                .utilisateurId(signalement.getUtilisateurId())
                .typeEntite(signalement.getTypeEntite())
                .entiteId(signalement.getEntiteId())
                .motif(signalement.getMotif())
                .description(signalement.getDescription())
                .statutTraitement(signalement.getStatutTraitement())
                .actionAdmin(signalement.getActionAdmin())
                .adminId(signalement.getAdminId())
                .dateTraitement(signalement.getDateTraitement())
                .dateSignalement(signalement.getDateSignalement())
                .build();
    }
}
