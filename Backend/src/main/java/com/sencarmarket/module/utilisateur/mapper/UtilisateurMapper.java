package com.sencarmarket.module.utilisateur.mapper;

import com.sencarmarket.module.utilisateur.dto.UtilisateurResponse;
import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper pour les conversions Utilisateur - Respecte SRP et DRY
 */
@Component
public class UtilisateurMapper {

    public UtilisateurResponse toResponse(Utilisateur utilisateur) {
        if (utilisateur == null) {
            return null;
        }

        String typeRole = utilisateur.getTypeUtilisateur() != null 
                ? utilisateur.getTypeUtilisateur().getNom() 
                : null;
        String statutVerif = utilisateur.getStatutVerification();

        return UtilisateurResponse.builder()
                .id(utilisateur.getId())
                .email(utilisateur.getEmail())
                .nom(utilisateur.getNom())
                .prenom(utilisateur.getPrenom())
                .telephone(utilisateur.getTelephone())
                .photoProfilUrl(utilisateur.getPhotoProfilUrl())
                .typeUtilisateur(typeRole)
                .statutVerification(statutVerif)
                .emailVerifie(utilisateur.getEmailVerifie())
                .telephoneVerifie(utilisateur.getTelephoneVerifie())
                .doubleAuthActive(utilisateur.getDoubleAuthActive())
                .createdAt(utilisateur.getCreatedAt())
                .build();
    }

    public List<UtilisateurResponse> toResponseList(List<Utilisateur> utilisateurs) {
        return utilisateurs.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}
