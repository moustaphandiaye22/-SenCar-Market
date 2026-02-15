package com.sencarmarket.module.utilisateur.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    private String prenom;
    private String nom;
    private String telephone;
    private String photoProfilUrl;
}
