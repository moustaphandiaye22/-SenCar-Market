package com.sencarmarket.module.utilisateur.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "L'email ou le téléphone est obligatoire")
    private String identifiant; // Peut être email ou téléphone

    @NotBlank(message = "Le mot de passe est obligatoire")
    private String motDePasse;
}
