package com.sencarmarket.module.utilisateur.service.auth;

import com.sencarmarket.module.commun.exception.InvalidOperationException;
import com.sencarmarket.module.commun.constants.AppMessages;
import com.sencarmarket.module.commun.service.AuditService;
import com.sencarmarket.module.utilisateur.dto.*;
import com.sencarmarket.module.utilisateur.entity.OtpCode;
import com.sencarmarket.module.utilisateur.entity.TypeUtilisateur;
import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.utilisateur.repository.UtilisateurRepository;
import com.sencarmarket.module.utilisateur.service.OtpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
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
    private final AuditService auditService;
    private final RegistrationPolicyService registrationPolicyService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        registrationPolicyService.validateUniqueCredentials(request.getEmail(), request.getTelephone());
        TypeUtilisateur typeUtilisateur = registrationPolicyService.resolveRegistrationType(request.getTypeUtilisateur());

        // Créer l'utilisateur
        Utilisateur utilisateur = Utilisateur.builder()
                .id(UUID.randomUUID())
                .email(request.getEmail())
                .telephone(request.getTelephone())
                .motDePasseHash(passwordEncoder.encode(request.getMotDePasse()))
                .prenom(request.getPrenom())
                .nom(request.getNom())
                .typeUtilisateur(typeUtilisateur)
                .emailVerifie(false)
                .telephoneVerifie(false)
                .doubleAuthActive(false)
                .build();

        utilisateurRepository.save(utilisateur);
        log.info("Nouvel utilisateur inscrit: {} avec le type: {}", utilisateur.getEmail(), typeUtilisateur.getNom());
        otpService.generateOtp(utilisateur, OtpCode.OtpType.VERIFICATION_EMAIL);

        // Journaliser l'inscription
        auditService.logRegistration(request.getEmail(), typeUtilisateur.getNom());

        // Générer les tokens
        UserDetails userDetails = userDetailsService.loadUserByEmail(request.getEmail());
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return buildAuthResponse(accessToken, refreshToken, utilisateur);
    }

    public AuthResponse login(LoginRequest request) {
        String identifiant = request.getIdentifiant().trim();
        Utilisateur utilisateur = utilisateurRepository.findByEmail(identifiant)
                .orElseGet(() -> utilisateurRepository.findByTelephone(identifiant)
                        .orElseThrow(() -> new BadCredentialsException(AppMessages.INVALID_CREDENTIALS)));

        // Authentifier l'utilisateur
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            utilisateur.getEmail(),
                            request.getMotDePasse()
                    )
            );
        } catch (Exception e) {
            // Journaliser l'échec de connexion
            auditService.logLogin(null, identifiant, null, false, e.getMessage());
            throw new BadCredentialsException(AppMessages.INVALID_CREDENTIALS);
        }

        // Mettre à jour la dernière connexion
        utilisateur.setDerniereConnexion(LocalDateTime.now());
        utilisateurRepository.save(utilisateur);

        // Journaliser la connexion réussie
        auditService.logLogin(utilisateur.getId(), utilisateur.getEmail(), null, true, null);

        // Générer les tokens
        UserDetails userDetails = userDetailsService.loadUserByEmail(utilisateur.getEmail());
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return buildAuthResponse(accessToken, refreshToken, utilisateur);
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        // Extraire le username du refresh token
        String refreshToken = request.getRefreshToken();
        String username = jwtService.extractUsername(refreshToken);

        // Charger l'utilisateur
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        Utilisateur utilisateur = utilisateurRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException(AppMessages.USER_NOT_FOUND));

        // Vérifier si le token est valide
        if (!jwtService.isTokenValid(refreshToken, userDetails)) {
            throw new InvalidOperationException(AppMessages.AUTH_REFRESH_TOKEN_INVALID);
        }

        // Générer nouveaux tokens
        String newAccessToken = jwtService.generateToken(userDetails);
        String newRefreshToken = jwtService.generateRefreshToken(userDetails);

        return buildAuthResponse(newAccessToken, newRefreshToken, utilisateur);
    }

    public UtilisateurResponse getCurrentUser(String email) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(AppMessages.USER_NOT_FOUND));
        return mapToUtilisateurResponse(utilisateur);
    }

    @Transactional
    public UtilisateurResponse updateProfile(String email, UpdateProfileRequest request) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(AppMessages.USER_NOT_FOUND));

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
                            throw new InvalidOperationException(AppMessages.AUTH_PHONE_ALREADY_USED);
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
                .orElseThrow(() -> new UsernameNotFoundException(AppMessages.USER_NOT_FOUND));

        // Vérifier l'ancien mot de passe
        if (!passwordEncoder.matches(request.getMotDePasseActuel(), utilisateur.getMotDePasseHash())) {
            // Journaliser l'échec
            auditService.logPasswordChange(utilisateur.getId(), email, false);
            throw new InvalidOperationException(AppMessages.AUTH_CURRENT_PASSWORD_INVALID);
        }

        // Mettre à jour le mot de passe
        utilisateur.setMotDePasseHash(passwordEncoder.encode(request.getNouveauMotDePasse()));
        utilisateurRepository.save(utilisateur);
        
        // Journaliser le succès
        auditService.logPasswordChange(utilisateur.getId(), email, true);
    }

    @Transactional
    public void resetPassword(Utilisateur utilisateur, String nouveauMotDePasse) {
        utilisateur.setMotDePasseHash(passwordEncoder.encode(nouveauMotDePasse));
        utilisateurRepository.save(utilisateur);
    }

    @Transactional
    public void verifyEmail(String email) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(AppMessages.USER_NOT_FOUND));
        utilisateur.setEmailVerifie(true);
        utilisateurRepository.save(utilisateur);
    }
    
    @Override
    @Transactional
    public void verifyEmailWithOtp(String email, String otpCode) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(AppMessages.USER_NOT_FOUND));
        otpService.verifyOtp(utilisateur, OtpCode.OtpType.VERIFICATION_EMAIL, otpCode);
        utilisateur.setEmailVerifie(true);
        utilisateurRepository.save(utilisateur);
    }

    @Transactional
    public void resendOtp(String email) {
        utilisateurRepository.findByEmail(email)
                .ifPresent(utilisateur -> otpService.generateOtp(utilisateur, OtpCode.OtpType.VERIFICATION_EMAIL));
    }

    public void sendPasswordResetOtp(String email) {
        utilisateurRepository.findByEmail(email)
                .ifPresent(utilisateur -> otpService.generateOtp(utilisateur, OtpCode.OtpType.MOT_DE_PASSE_OUBLIE));
    }

    @Transactional
    public void resetPasswordByEmail(String email, String codeOtp, String nouveauMotDePasse) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(AppMessages.USER_NOT_FOUND));

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
                .statutVerification(utilisateur.getStatutVerification())
                .createdAt(utilisateur.getCreatedAt())
                .build();
    }

    private AuthResponse buildAuthResponse(String accessToken, String refreshToken, Utilisateur utilisateur) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getJwtExpiration() / 1000)
                .utilisateur(mapToUtilisateurResponse(utilisateur))
                .build();
    }
}
