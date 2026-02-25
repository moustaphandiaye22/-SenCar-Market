package com.sencarmarket.module.utilisateur.controller;

import com.sencarmarket.module.utilisateur.dto.UtilisateurResponse;
import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.utilisateur.service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/utilisateurs")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class UtilisateurController {

    private final UtilisateurService utilisateurService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATEUR', 'SUPER_ADMIN')")
    public ResponseEntity<List<UtilisateurResponse>> findAll() {
        return ResponseEntity.ok(
                utilisateurService.findAll().stream()
                        .map(this::toResponse)
                        .collect(Collectors.toList())
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATEUR', 'SUPER_ADMIN')")
    public ResponseEntity<UtilisateurResponse> findById(@PathVariable UUID id) {
        return utilisateurService.findById(id)
                .map(this::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATEUR', 'SUPER_ADMIN')")
    public ResponseEntity<UtilisateurResponse> findByEmail(@PathVariable String email) {
        return utilisateurService.findByEmail(email)
                .map(this::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/telephone/{telephone}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATEUR', 'SUPER_ADMIN')")
    public ResponseEntity<UtilisateurResponse> findByTelephone(@PathVariable String telephone) {
        return utilisateurService.findByTelephone(telephone)
                .map(this::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<UtilisateurResponse> save(@RequestBody Utilisateur utilisateur) {
        return ResponseEntity.ok(toResponse(utilisateurService.save(utilisateur)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteById(@PathVariable UUID id) {
        utilisateurService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private UtilisateurResponse toResponse(Utilisateur utilisateur) {
        return UtilisateurResponse.builder()
                .id(utilisateur.getId())
                .email(utilisateur.getEmail())
                .telephone(utilisateur.getTelephone())
                .prenom(utilisateur.getPrenom())
                .nom(utilisateur.getNom())
                .photoProfilUrl(utilisateur.getPhotoProfilUrl())
                .emailVerifie(utilisateur.getEmailVerifie())
                .telephoneVerifie(utilisateur.getTelephoneVerifie())
                .doubleAuthActive(utilisateur.getDoubleAuthActive())
                .typeUtilisateur(utilisateur.getTypeUtilisateur() != null ? utilisateur.getTypeUtilisateur().getNom() : null)
                .statutVerification(utilisateur.getStatutVerification())
                .createdAt(utilisateur.getCreatedAt())
                .build();
    }
}
