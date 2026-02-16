package com.sencarmarket.module.utilisateur.service;

import com.sencarmarket.module.utilisateur.entity.Utilisateur;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Interface pour le service utilisateur
 * Implémente le principe de DIP (Dependency Inversion Principle)
 */
public interface IUtilisateurService {

    List<Utilisateur> findAll();

    Optional<Utilisateur> findById(UUID id);

    Optional<Utilisateur> findByEmail(String email);

    Optional<Utilisateur> findByTelephone(String telephone);

    Utilisateur save(Utilisateur utilisateur);

    void deleteById(UUID id);

    boolean existsByEmail(String email);

    boolean existsByTelephone(String telephone);
}
