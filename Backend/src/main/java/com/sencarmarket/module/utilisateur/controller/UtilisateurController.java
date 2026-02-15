package com.sencarmarket.module.utilisateur.controller;

import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.utilisateur.service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/utilisateurs")
@RequiredArgsConstructor
public class UtilisateurController {

    private final UtilisateurService utilisateurService;

    @GetMapping
    public ResponseEntity<List<Utilisateur>> findAll() {
        return ResponseEntity.ok(utilisateurService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Utilisateur> findById(@PathVariable UUID id) {
        return utilisateurService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Utilisateur> findByEmail(@PathVariable String email) {
        return utilisateurService.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/telephone/{telephone}")
    public ResponseEntity<Utilisateur> findByTelephone(@PathVariable String telephone) {
        return utilisateurService.findByTelephone(telephone)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Utilisateur> save(@RequestBody Utilisateur utilisateur) {
        return ResponseEntity.ok(utilisateurService.save(utilisateur));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable UUID id) {
        utilisateurService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
