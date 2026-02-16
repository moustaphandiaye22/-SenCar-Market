package com.sencarmarket.module.utilisateur.service.auth;

import com.sencarmarket.module.utilisateur.dto.*;
import com.sencarmarket.module.utilisateur.entity.OtpCode;
import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.utilisateur.repository.UtilisateurRepository;
import com.sencarmarket.module.utilisateur.service.OtpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService implements IAuthenticationService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final OtpService otpService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Vérifier si l'email existe déjà
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("L'email existe déjà");
        }

        // Vérifier si le téléphone existe déjà
        if (utilisateurRepository.existsByTelephone(request.getTelephone())) {
            throw new RuntimeException("Le téléphone existe déjà");
        }

        // Créer l'utilisateur
        Utilisateur utilisateur = Utilisateur.builder()
                .id(UUID.randomUUID())
                .email(request.getEmail())
                .telephone(request.getTelephone())
                .motDePasseHash(passwordEncoder.encode(request.getMotDePasse()))
                .prenom(request.getPrenom())
                .nom(request.getNom())
                .emailVerifie(false)
                .telephoneVerifie(false)
                .doubleAuthActive(false)
                .build();

        utilisateurRepository.save(utilisateur);

        // Générer les tokens
        UserDetails userDetails = userDetailsService.loadUserByEmail(request.getEmail());
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getJwtExpiration() / 1000)
                .utilisateur(mapToUtilisateurResponse(utilisateur))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        // Authentifier l'utilisateur
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getIdentifiant(),
                        request.getMotDePasse()
                )
        );

        // Rechercher l'utilisateur
        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.getIdentifiant())
                .orElseGet(() -> utilisateurRepository.findByTelephone(request.getIdentifiant())
                        .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé")));

        // Mettre à jour la dernière connexion
        utilisateur.setDerniereConnexion(LocalDateTime.now());
        utilisateurRepository.save(utilisateur);

        // Générer les tokens
        UserDetails userDetails = userDetailsService.loadUserByEmail(utilisateur.getEmail());
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getJwtExpiration() / 1000)
                .utilisateur(mapToUtilisateurResponse(utilisateur))
                .build();
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        // Extraire le username du refresh token
        String refreshToken = request.getRefreshToken();
        String username = jwtService.extractUsername(refreshToken);

        // Charger l'utilisateur
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        Utilisateur utilisateur = utilisateurRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        // Vérifier si le token est valide
        if (!jwtService.isTokenValid(refreshToken, userDetails)) {
            throw new RuntimeException("Refresh token invalide");
        }

        // Générer nouveaux tokens
        String newAccessToken = jwtService.generateToken(userDetails);
        String newRefreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getJwtExpiration() / 1000)
                .utilisateur(mapToUtilisateurResponse(utilisateur))
                .build();
    }

    public UtilisateurResponse getCurrentUser(String email) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));
        return mapToUtilisateurResponse(utilisateur);
    }

    @Transactional
    public UtilisateurResponse updateProfile(String email, UpdateProfileRequest request) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        if (request.getPrenom() != null) {
            utilisateur.setPrenom(request.getPrenom());
        }
        if (request.getNom() != null) {
            utilisateur.setNom(request.getNom());
        }
        if (request.getTelephone() != null) {
            // Vérifier si le nouveau téléphone n'est pas utilisé par un autre utilisateur
            utilisateurRepository.findByTelephone(request.getTelephone())
                    .ifPresent(u -> {
                        if (!u.getId().equals(utilisateur.getId())) {
                            throw new RuntimeException("Ce téléphone est déjà utilisé");
                        }
                    });
            utilisateur.setTelephone(request.getTelephone());
        }
        if (request.getPhotoProfilUrl() != null) {
            utilisateur.setPhotoProfilUrl(request.getPhotoProfilUrl());
        }

        utilisateurRepository.save(utilisateur);
        return mapToUtilisateurResponse(utilisateur);
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        // Vérifier l'ancien mot de passe
        if (!passwordEncoder.matches(request.getMotDePasseActuel(), utilisateur.getMotDePasseHash())) {
            throw new RuntimeException("Le mot de passe actuel est incorrect");
        }

        // Mettre à jour le mot de passe
        utilisateur.setMotDePasseHash(passwordEncoder.encode(request.getNouveauMotDePasse()));
        utilisateurRepository.save(utilisateur);
    }

    @Transactional
    public void resetPassword(Utilisateur utilisateur, String nouveauMotDePasse) {
        utilisateur.setMotDePasseHash(passwordEncoder.encode(nouveauMotDePasse));
        utilisateurRepository.save(utilisateur);
    }

    @Transactional
    public void verifyEmail(String email) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));
        utilisateur.setEmailVerifie(true);
        utilisateurRepository.save(utilisateur);
    }

    @Transactional
    public void resendOtp(String email) {
        // Cette méthode est un hook - l'OTP est généré par OtpService
        // Pas d'action nécessaire ici car l'OTP est géré par OtpService
    }

    public void sendPasswordResetOtp(String email) {
        // Cette méthode est un hook - l'OTP est généré par OtpService
        // Pas d'action nécessaire ici car l'OTP est géré par OtpService
    }

    @Transactional
    public void resetPasswordByEmail(String email, String codeOtp, String nouveauMotDePasse) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        otpService.verifyOtp(utilisateur, OtpCode.OtpType.MOT_DE_PASSE_OUBLIE, codeOtp);

        utilisateur.setMotDePasseHash(passwordEncoder.encode(nouveauMotDePasse));
        utilisateurRepository.save(utilisateur);
    }

    private UtilisateurResponse mapToUtilisateurResponse(Utilisateur utilisateur) {
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
                .typeUtilisateur(utilisateur.getTypeUtilisateur() != null ? 
                        utilisateur.getTypeUtilisateur().getNom() : null)
                .statutVerification(utilisateur.getStatutVerification() != null ? 
                        utilisateur.getStatutVerification().getNom() : null)
                .createdAt(utilisateur.getCreatedAt())
                .build();
    }
}
