package com.sencarmarket.module.utilisateur.service.auth;

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
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé avec: " + usernameOrEmail));

        return new User(
                utilisateur.getEmail(),
                utilisateur.getMotDePasseHash(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );
    }

    public UserDetails loadUserByEmail(String email) throws UsernameNotFoundException {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé avec: " + email));

        return new User(
                utilisateur.getEmail(),
                utilisateur.getMotDePasseHash(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );
    }
}
