package com.sencarmarket.module.annonce.controller;

import com.sencarmarket.module.annonce.dto.*;
import com.sencarmarket.module.annonce.entity.DisponibiliteLocation;
import com.sencarmarket.module.annonce.entity.HistoriqueStatutReservation;
import com.sencarmarket.module.annonce.service.AnnonceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class LocationController {

    private final AnnonceService annonceService;

    // ========== ANNONCES DE LOCATION ==========

    /**
     * Creer une annonce de location - Proprietaire Loueur uniquement
     */
    @PostMapping("/annonces")
    @PreAuthorize("hasAnyRole('PROPRIETAIRE_LOUEUR', 'VENDEUR', 'CONCESSIONNAIRE', 'ADMIN')")
    public ResponseEntity<AnnonceLocationResponse> createAnnonceLocation(
            @Valid @RequestBody CreateAnnonceLocationRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(annonceService.createAnnonceLocation(request, authentication.getName()));
    }

    @PutMapping("/annonces/{id}")
    public ResponseEntity<AnnonceLocationResponse> updateAnnonceLocation(
            @PathVariable UUID id,
            @RequestBody CreateAnnonceLocationRequest request) {
        return ResponseEntity.ok(annonceService.updateAnnonceLocation(id, request));
    }

    @DeleteMapping("/annonces/{id}")
    public ResponseEntity<Void> deleteAnnonceLocation(@PathVariable UUID id) {
        annonceService.deleteAnnonceLocation(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/annonces/{id}")
    public ResponseEntity<AnnonceLocationResponse> getAnnonceLocationById(@PathVariable UUID id) {
        return ResponseEntity.ok(annonceService.getAnnonceLocationById(id));
    }

    @GetMapping("/annonces")
    public ResponseEntity<List<AnnonceLocationResponse>> getAllAnnoncesLocation() {
        return ResponseEntity.ok(annonceService.getAllAnnoncesLocation());
    }

    @GetMapping("/mes-annonces")
    public ResponseEntity<List<AnnonceLocationResponse>> getMesAnnonces(Authentication authentication) {
        return ResponseEntity.ok(annonceService.getMesAnnoncesLocation(authentication.getName()));
    }

    @PostMapping("/annonces/{id}/activer")
    public ResponseEntity<AnnonceLocationResponse> activerAnnonce(@PathVariable UUID id) {
        return ResponseEntity.ok(annonceService.activerDesactiverAnnonce(id, true));
    }

    @PostMapping("/annonces/{id}/desactiver")
    public ResponseEntity<AnnonceLocationResponse> desactiverAnnonce(@PathVariable UUID id) {
        return ResponseEntity.ok(annonceService.activerDesactiverAnnonce(id, false));
    }

    // ========== RÉSERVATIONS ==========

    @PostMapping("/reservations")
    public ResponseEntity<ReservationLocationResponse> createReservation(
            @Valid @RequestBody CreateReservationRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(annonceService.createReservation(request, authentication.getName()));
    }

    @PutMapping("/reservations/{id}/statut")
    public ResponseEntity<ReservationLocationResponse> updateStatutReservation(
            @PathVariable UUID id,
            @RequestParam String statut) {
        return ResponseEntity.ok(annonceService.updateStatutReservation(id, statut));
    }

    @PostMapping("/reservations/{id}/annuler")
    public ResponseEntity<Void> cancelReservation(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body) {
        String motif = body != null ? body.get("motif") : null;
        annonceService.cancelReservation(id, motif);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/reservations/{id}")
    public ResponseEntity<ReservationLocationResponse> getReservationById(@PathVariable UUID id) {
        return ResponseEntity.ok(annonceService.getReservationById(id));
    }

    @GetMapping("/mes-reservations")
    public ResponseEntity<List<ReservationLocationResponse>> getMesReservations(Authentication authentication) {
        return ResponseEntity.ok(annonceService.getMesReservations(authentication.getName()));
    }

    @GetMapping("/annonces/{id}/reservations")
    public ResponseEntity<List<ReservationLocationResponse>> getReservationsByAnnonce(@PathVariable UUID id) {
        return ResponseEntity.ok(annonceService.getReservationsByAnnonce(id));
    }
    
    // ========== DISPONIBILITÉS ==========
    
    @PostMapping("/annonces/{id}/disponibilites")
    public ResponseEntity<List<DisponibiliteLocation>> ajouterDisponibilites(
            @PathVariable UUID id,
            @Valid @RequestBody List<DisponibiliteRequest> request) {
        return ResponseEntity.ok(annonceService.ajouterDisponibilites(id, request));
    }
    
    @GetMapping("/annonces/{id}/disponibilites")
    public ResponseEntity<List<DisponibiliteLocation>> getDisponibilites(@PathVariable UUID id) {
        return ResponseEntity.ok(annonceService.getDisponibilites(id));
    }
    
    @DeleteMapping("/annonces/{id}/disponibilites")
    public ResponseEntity<Void> supprimerDisponibilites(@PathVariable UUID id) {
        annonceService.supprimerDisponibilites(id);
        return ResponseEntity.noContent().build();
    }
    
    // ========== HISTORIQUE DES STATUTS ==========
    
    @GetMapping("/reservations/{id}/historique")
    public ResponseEntity<List<HistoriqueStatutReservation>> getHistoriqueStatuts(@PathVariable UUID id) {
        return ResponseEntity.ok(annonceService.getHistoriqueStatuts(id));
    }
    
    @PutMapping("/reservations/{id}/statut-avec-historique")
    public ResponseEntity<ReservationLocationResponse> updateStatutReservationAvecHistorique(
            @PathVariable UUID id,
            @RequestParam String statut) {
        return ResponseEntity.ok(annonceService.updateStatutReservationAvecHistorique(id, statut));
    }
}
