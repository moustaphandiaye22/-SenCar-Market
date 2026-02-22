package com.sencarmarket.module.utilisateur.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;

    @NotBlank(message = "Le téléphone est obligatoire")
    private String telephone;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    private String motDePasse;

    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    /**
     * Type d'utilisateur - doit être l'un des types valides:
     * - UTILISATEUR (default)
     * - ACHETEUR
     * - VENDEUR
     * - CONCESSIONNAIRE
     * - LOCATAIRE
     * - PROPRIETAIRE_LOUEUR
     * 
     * Les types suivants sont réservés et attribués manuellement:
     * - ADMIN, MODERATEUR, SUPER_ADMIN
     * - COMPAGNIE_ASSURANCE, INSPECTEUR, GARAGE, PARTENAIRE_FINANCIER
     */
    @NotNull(message = "Le type d'utilisateur est obligatoire")
    private String typeUtilisateur;
}
