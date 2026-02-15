package com.sencarmarket.module.utilisateur.controller;

import com.sencarmarket.module.utilisateur.dto.*;
import com.sencarmarket.module.utilisateur.entity.OtpCode;
import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.utilisateur.repository.UtilisateurRepository;
import com.sencarmarket.module.utilisateur.service.OtpService;
import com.sencarmarket.module.utilisateur.service.auth.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authenticationService;
    private final OtpService otpService;
    private final UtilisateurRepository utilisateurRepository;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authenticationService.register(request));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        otpService.verifyOtp(utilisateur, OtpCode.OtpType.INSCRIPTION, request.getCodeOtp());

        // Mettre à jour le statut de vérification
        utilisateur.setEmailVerifie(true);
        utilisateurRepository.save(utilisateur);

        return ResponseEntity.ok(Map.of("message", "Email vérifié avec succès"));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<Map<String, String>> resendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        otpService.generateOtp(utilisateur, OtpCode.OtpType.INSCRIPTION);

        return ResponseEntity.ok(Map.of("message", "Code OTP renvoyé avec succès"));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authenticationService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authenticationService.refreshToken(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UtilisateurResponse> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(authenticationService.getCurrentUser(authentication.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<UtilisateurResponse> updateProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(authenticationService.updateProfile(authentication.getName(), request));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        authenticationService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        utilisateurRepository.findByEmail(email).ifPresent(utilisateur -> {
            otpService.generateOtp(utilisateur, OtpCode.OtpType.MOT_DE_PASSE_OUBLIE);
        });

        // Toujours retourner un succès pour des raisons de sécurité
        return ResponseEntity.ok(Map.of("message", "Si l'email existe, un code OTP sera envoyé"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        otpService.verifyOtp(utilisateur, OtpCode.OtpType.MOT_DE_PASSE_OUBLIE, request.getCodeOtp());

        authenticationService.resetPassword(utilisateur, request.getNouveauMotDePasse());

        return ResponseEntity.ok(Map.of("message", "Mot de passe réinitialisé avec succès"));
    }
}
