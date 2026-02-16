package com.sencarmarket.module.utilisateur.service;

import com.sencarmarket.module.utilisateur.entity.OtpCode;
import com.sencarmarket.module.utilisateur.entity.Utilisateur;

/**
 * Interface pour le service OTP
 * Implémente le principe de DIP (Dependency Inversion Principle)
 */
public interface IOtpService {

    OtpCode generateOtp(Utilisateur utilisateur, OtpCode.OtpType type);

    void verifyOtp(Utilisateur utilisateur, OtpCode.OtpType type, String codeOtp);

    void deleteOtp(OtpCode otpCode);

    void deleteExpiredOtps();
}
