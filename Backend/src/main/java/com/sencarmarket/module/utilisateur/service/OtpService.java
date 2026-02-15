package com.sencarmarket.module.utilisateur.service;

import com.sencarmarket.module.utilisateur.entity.OtpCode;
import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.utilisateur.repository.OtpCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpCodeRepository otpCodeRepository;

    @Value("${otp.expiration-minutes:10}")
    private int expirationMinutes;

    @Value("${otp.max-tentatives:5}")
    private int maxTentatives;

    private static final String OTP_CHARS = "0123456789";
    private static final int OTP_LENGTH = 6;

    @Transactional
    public OtpCode generateOtp(Utilisateur utilisateur, OtpCode.OtpType type) {
        // Supprimer les anciens OTP non utilisés de ce type
        var oldOtps = otpCodeRepository.findByUtilisateurAndTypeAndUtiliseFalse(utilisateur, type);
        otpCodeRepository.deleteAll(oldOtps);

        // Générer un nouveau code OTP
        String code = generateRandomCode();

        // Créer l'OTP
        OtpCode otpCode = OtpCode.builder()
                .utilisateur(utilisateur)
                .code(code)
                .type(type)
                .expiration(LocalDateTime.now().plusMinutes(expirationMinutes))
                .utilise(false)
                .tentatives(0)
                .build();

        otpCodeRepository.save(otpCode);

        // TODO: Envoyer le code par email ou SMS
        // emailService.sendOtp(utilisateur.getEmail(), code);

        return otpCode;
    }

    @Transactional
    public boolean verifyOtp(Utilisateur utilisateur, OtpCode.OtpType type, String code) {
        var otpOpt = otpCodeRepository.findValidOtp(utilisateur, type, LocalDateTime.now());

        if (otpOpt.isEmpty()) {
            throw new RuntimeException("Code OTP invalide ou expiré");
        }

        OtpCode otpCode = otpOpt.get();

        // Vérifier si le nombre de tentatives maximum est atteint
        if (otpCode.getTentatives() >= maxTentatives) {
            otpCode.setUtilise(true);
            otpCodeRepository.save(otpCode);
            throw new RuntimeException("Nombre de tentatives maximum atteint. Veuillez demander un nouveau code.");
        }

        // Vérifier le code
        if (!otpCode.getCode().equals(code)) {
            otpCode.setTentatives(otpCode.getTentatives() + 1);
            otpCodeRepository.save(otpCode);
            throw new RuntimeException("Code OTP incorrect");
        }

        // Marquer comme utilisé
        otpCode.setUtilise(true);
        otpCodeRepository.save(otpCode);

        return true;
    }

    public boolean hasExceededMaxAttempts(Utilisateur utilisateur, OtpCode.OtpType type) {
        var otpOpt = otpCodeRepository.findValidOtp(utilisateur, type, LocalDateTime.now());
        if (otpOpt.isEmpty()) {
            return false;
        }
        return otpOpt.get().getTentatives() >= maxTentatives;
    }

    private String generateRandomCode() {
        Random random = new Random();
        StringBuilder code = new StringBuilder(OTP_LENGTH);
        for (int i = 0; i < OTP_LENGTH; i++) {
            code.append(OTP_CHARS.charAt(random.nextInt(OTP_CHARS.length())));
        }
        return code.toString();
    }

    public void cleanExpiredOtps() {
        otpCodeRepository.deleteByExpirationBefore(LocalDateTime.now());
    }
}
