package com.sencarmarket.module.vehicule.controller;

import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.vehicule.dto.CreateVehiculeRequest;
import com.sencarmarket.module.vehicule.dto.VehiculeFilter;
import com.sencarmarket.module.vehicule.dto.VehiculeResponse;
import com.sencarmarket.module.vehicule.service.VehiculeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vehicules")
@RequiredArgsConstructor
public class VehiculeController {

    private final VehiculeService vehiculeService;

    @PostMapping
    public ResponseEntity<VehiculeResponse> createVehicule(
            @Valid @RequestBody CreateVehiculeRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(vehiculeService.createVehicule(request, authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<VehiculeResponse>> searchVehicules(
            @ModelAttribute VehiculeFilter filter) {
        return ResponseEntity.ok(vehiculeService.searchVehicules(filter));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehiculeResponse> getVehiculeById(@PathVariable UUID id) {
        return ResponseEntity.ok(vehiculeService.getVehiculeById(id));
    }

    @GetMapping("/moi")
    public ResponseEntity<List<VehiculeResponse>> getMesVehicules(Authentication authentication) {
        return ResponseEntity.ok(vehiculeService.getMesVehicules(authentication.getName()));
    }

    @PutMapping("/{id}/publish")
    public ResponseEntity<VehiculeResponse> publishVehicule(@PathVariable UUID id) {
        return ResponseEntity.ok(vehiculeService.publishVehicule(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicule(@PathVariable UUID id) {
        vehiculeService.deleteVehicule(id);
        return ResponseEntity.noContent().build();
    }

    // Favoris
    @PostMapping("/{id}/favoris")
    public ResponseEntity<Void> addToFavoris(@PathVariable UUID id, Authentication authentication) {
        vehiculeService.addToFavoris(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/favoris")
    public ResponseEntity<Void> removeFromFavoris(@PathVariable UUID id, Authentication authentication) {
        vehiculeService.removeFromFavoris(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/favoris/moi")
    public ResponseEntity<List<VehiculeResponse>> getMesFavoris(Authentication authentication) {
        return ResponseEntity.ok(vehiculeService.getMesFavoris(authentication.getName()));
    }

    // Boost
    @PostMapping("/{id}/boost")
    public ResponseEntity<VehiculeResponse> boostVehicule(
            @PathVariable UUID id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        return ResponseEntity.ok(vehiculeService.boostVehicule(id, debut, fin));
    }
}
