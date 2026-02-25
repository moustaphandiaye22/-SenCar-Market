package com.sencarmarket.module.utilisateur.service;

import com.sencarmarket.module.commun.constants.AppMessages;
import com.sencarmarket.module.commun.exception.InvalidOperationException;
import com.sencarmarket.module.utilisateur.entity.OtpCode;
import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.utilisateur.repository.OtpCodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService implements IOtpService {

    private final OtpCodeRepository otpCodeRepository;
    private final JavaMailSender mailSender;

    @Value("${otp.expiration-minutes:10}")
    private int expirationMinutes;

    @Value("${otp.max-tentatives:5}")
    private int maxTentatives;

    @Value("${otp.delivery.email.enabled:false}")
    private boolean otpEmailEnabled;

    @Value("${otp.delivery.email.from:no-reply@sencarmarket.com}")
    private String otpEmailFrom;

    private static final String OTP_CHARS = "0123456789";
    private static final int OTP_LENGTH = 6;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Override
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

        sendOtpByEmail(utilisateur, code, type);

        return otpCode;
    }

    @Override
    @Transactional
    public void verifyOtp(Utilisateur utilisateur, OtpCode.OtpType type, String code) {
        var otpOpt = otpCodeRepository.findValidOtp(utilisateur, type, LocalDateTime.now());

        if (otpOpt.isEmpty()) {
            throw new InvalidOperationException(AppMessages.OTP_INVALID_OR_EXPIRED);
        }

        OtpCode otpCode = otpOpt.get();

        // Vérifier si le nombre de tentatives maximum est atteint
        if (otpCode.getTentatives() >= maxTentatives) {
            otpCode.setUtilise(true);
            otpCodeRepository.save(otpCode);
            throw new InvalidOperationException(AppMessages.OTP_MAX_ATTEMPTS_REACHED);
        }

        // Vérifier le code
        if (!otpCode.getCode().equals(code)) {
            otpCode.setTentatives(otpCode.getTentatives() + 1);
            otpCodeRepository.save(otpCode);
            throw new InvalidOperationException(AppMessages.OTP_INCORRECT);
        }

        // Marquer comme utilisé
        otpCode.setUtilise(true);
        otpCodeRepository.save(otpCode);
    }

    @Override
    public void deleteOtp(OtpCode otpCode) {
        otpCodeRepository.delete(otpCode);
    }

    @Override
    public void deleteExpiredOtps() {
        otpCodeRepository.deleteByExpirationBefore(LocalDateTime.now());
    }

    public boolean hasExceededMaxAttempts(Utilisateur utilisateur, OtpCode.OtpType type) {
        var otpOpt = otpCodeRepository.findValidOtp(utilisateur, type, LocalDateTime.now());
        if (otpOpt.isEmpty()) {
            return false;
        }
        return otpOpt.get().getTentatives() >= maxTentatives;
    }

    private String generateRandomCode() {
        StringBuilder code = new StringBuilder(OTP_LENGTH);
        for (int i = 0; i < OTP_LENGTH; i++) {
            code.append(OTP_CHARS.charAt(SECURE_RANDOM.nextInt(OTP_CHARS.length())));
        }
        return code.toString();
    }

    private void sendOtpByEmail(Utilisateur utilisateur, String code, OtpCode.OtpType type) {
        if (utilisateur == null || utilisateur.getEmail() == null || utilisateur.getEmail().isBlank()) {
            return;
        }
        if (!otpEmailEnabled) {
            log.info("OTP email désactivé par configuration (type={}, utilisateurId={})", type,
                    utilisateur.getId());
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(otpEmailFrom);
            message.setTo(utilisateur.getEmail());
            message.setSubject("Votre code OTP Sen-Car-Market");
            message.setText(buildOtpMessage(code, type));
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Envoi OTP email échoué pour utilisateur {}: {}", utilisateur.getId(), e.getMessage(), e);
        }
    }

    private String buildOtpMessage(String code, OtpCode.OtpType type) {
        return "Code OTP: " + code + "\nType: " + type + "\nValidité: " + expirationMinutes
                + " minutes.\nNe partagez jamais ce code.";
    }
}
