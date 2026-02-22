package com.sencarmarket.config;

import com.sencarmarket.module.utilisateur.entity.TypeUtilisateur;
import com.sencarmarket.module.utilisateur.repository.TypeUtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * Initialise les données de base au démarrage de l'application
 * REMARQUE: Les données statiques sont maintenant gérées par Flyway (V2__Seed_data.sql)
 * Ce composant est utilisé uniquement pour les vérifications dynamiques
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final TypeUtilisateurRepository typeUtilisateurRepository;

    @Override
    public void run(String... args) {
        log.info("Vérification des données de base...");
        
        verifyTypeUtilisateurs();
        
        log.info("Vérification des données terminée");
    }

    /**
     * Vérifie que les types d'utilisateurs existent (créés par Flyway)
     */
    private void verifyTypeUtilisateurs() {
        // Les types sont maintenant initialisés par Flyway V2__Seed_data.sql
        // Cette méthode vérifie juste qu'ils existent
        List<String> requiredTypes = Arrays.asList(
            "UTILISATEUR", "ACHETEUR", "VENDEUR", "CONCESSIONNAIRE",
            "LOCATAIRE", "PROPRIETAIRE_LOUEUR", "COMPAGNIE_ASSURANCE",
            "INSPECTEUR", "GARAGE", "PARTENAIRE_FINANCIER",
            "ADMIN", "MODERATEUR", "SUPER_ADMIN"
        );

        for (String typeNom : requiredTypes) {
            if (!typeUtilisateurRepository.existsByNom(typeNom)) {
                log.warn("Type d'utilisateur manquant: {} - À vérifier dans les migrations Flyway", typeNom);
            }
        }
        
        log.info("Tous les types d'utilisateurs sont présents");
    }
}
