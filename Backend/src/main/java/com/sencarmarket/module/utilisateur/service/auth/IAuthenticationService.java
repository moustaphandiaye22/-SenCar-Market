package com.sencarmarket.module.utilisateur.service.auth;

import com.sencarmarket.module.utilisateur.dto.*;
import com.sencarmarket.module.utilisateur.entity.Utilisateur;

/**
 * Interface pour le service d'authentification
 * Implémente le principe de DIP (Dependency Inversion Principle)
 */
public interface IAuthenticationService {

    AuthResponse register(RegisterRequest request);

    void verifyEmail(String email);

    void resendOtp(String email);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(RefreshTokenRequest request);

    UtilisateurResponse getCurrentUser(String email);

    UtilisateurResponse updateProfile(String email, UpdateProfileRequest request);

    void changePassword(String email, ChangePasswordRequest request);

    void sendPasswordResetOtp(String email);

    void resetPasswordByEmail(String email, String codeOtp, String nouveauMotDePasse);
}
