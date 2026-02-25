package com.sencarmarket.module.utilisateur.service.auth;

import com.sencarmarket.module.commun.constants.AppMessages;
import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.utilisateur.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UtilisateurRepository utilisateurRepository;

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(usernameOrEmail)
                .orElseThrow(() -> new UsernameNotFoundException(AppMessages.USER_NOT_FOUND_WITH + usernameOrEmail));

        return new User(
                utilisateur.getEmail(),
                utilisateur.getMotDePasseHash(),
                Collections.singletonList(new SimpleGrantedAuthority(getRoleFromTypeUtilisateur(utilisateur)))
        );
    }

    public UserDetails loadUserByEmail(String email) throws UsernameNotFoundException {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(AppMessages.USER_NOT_FOUND_WITH + email));

        return new User(
                utilisateur.getEmail(),
                utilisateur.getMotDePasseHash(),
                Collections.singletonList(new SimpleGrantedAuthority(getRoleFromTypeUtilisateur(utilisateur)))
        );
    }
    
    /**
     * Retourne le role Spring Security base sur le TypeUtilisateur
     */
    private String getRoleFromTypeUtilisateur(Utilisateur utilisateur) {
        if (utilisateur.getTypeUtilisateur() == null || utilisateur.getTypeUtilisateur().getNom() == null) {
            return "ROLE_UTILISATEUR"; // Role par defaut
        }
        
        String typeNom = utilisateur.getTypeUtilisateur().getNom();
        
        // Mapper les types vers les roles Spring Security
        return switch (typeNom) {
            case "ADMIN" -> "ROLE_ADMIN";
            case "SUPER_ADMIN" -> "ROLE_SUPER_ADMIN";
            case "MODERATEUR" -> "ROLE_MODERATEUR";
            case "VENDEUR" -> "ROLE_VENDEUR";
            case "CONCESSIONNAIRE" -> "ROLE_CONCESSIONNAIRE";
            case "ACHETEUR" -> "ROLE_ACHETEUR";
            case "LOCATAIRE" -> "ROLE_LOCATAIRE";
            case "PROPRIETAIRE_LOUEUR" -> "ROLE_PROPRIETAIRE_LOUEUR";
            case "COMPAGNIE_ASSURANCE" -> "ROLE_COMPAGNIE_ASSURANCE";
            case "INSPECTEUR" -> "ROLE_INSPECTEUR";
            case "GARAGE" -> "ROLE_GARAGE";
            case "PARTENAIRE_FINANCIER" -> "ROLE_PARTENAIRE_FINANCIER";
            default -> "ROLE_UTILISATEUR";
        };
    }
}
