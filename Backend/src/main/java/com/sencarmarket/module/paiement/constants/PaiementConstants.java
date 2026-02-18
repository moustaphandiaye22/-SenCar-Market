package com.sencarmarket.module.paiement.constants;

/**
 * Constants pour le module paiement
 * Évite les magic numbers et magic strings
 */
public final class PaiementConstants {
    
    private PaiementConstants() {
        // Empêche l'instanciation
    }
    
    // ========== COMMISSION ==========
    public static final double COMMISSION_DEFAUT = 0.05; // 5%
    public static final double COMMISSION_MIN = 0.01;   // 1%
    public static final double COMMISSION_MAX = 0.10;   // 10%
    
    // ========== MONTANTS ==========
    public static final double MONTANT_MINIMUM = 100.0; // XOF
    public static final double MONTANT_MAXIMUM = 5000000.0; // XOF
    
    // ========== TIMEOUTS (millisecondes) ==========
    public static final int TIMEOUT_WAVE_API = 30000;
    public static final int TIMEOUT_OM_API = 30000;
    public static final int TIMEOUT_WEBHOOK = 10000;
    
    // ========== CODES ERREUR ==========
    public static final String ERR_SOLDE_INSUFFISANT = "SOLDE_INSUFFISANT";
    public static final String ERR_MONTANT_INVALID = "MONTANT_INVALID";
    public static final String ERR_PAIEMENT_ANNULE = "PAIEMENT_ANNULE";
    public static final String ERR_PAIEMENT_EXPIRE = "PAIEMENT_EXPIRE";
    public static final String ERR_WEBHOOK_INVALIDE = "WEBHOOK_INVALIDE";
    public static final String ERR_RETRAIT_EN_COURS = "RETRAIT_EN_COURS";
    
    // ========== MESSAGES ==========
    public static final String MSG_PAIEMENT_CREE = "Paiement créé avec succès";
    public static final String MSG_PAIEMENT_CONFIRME = "Paiement confirmé";
    public static final String MSG_PAIEMENT_ANNULE = "Paiement annulé";
    public static final String MSG_PAIEMENT_REMBOURSE = "Paiement remboursé";
    public static final String MSG_PORTFEUILLE_CREDITE = "Portefeuille crédité";
    public static final String MSG_PORTFEUILLE_DEBITE = "Portefeuille débité";
    public static final String MSG_RETRAIT_INITIE = "Retrait initié";
    
    // ========== DURÉES (en minutes) ==========
    public static final int DUREE_EXPIRATION_PAIEMENT = 30;
    public static final int DUREE_EXPIRATION_OTP = 10;
    public static final int DUREE_RETRAIT_MAX = 1440; // 24 heures
    
    // ========== REGEX ==========
    public static final String REGEX_TELEPHONE = "^[+]?[0-9]{8,15}$";
    public static final String REGEX_REFERENCE = "^[A-Z0-9]{10,50}$";
    
    // ========== URLs ==========
    public static final String URL_WAVE_API = "https://api.wave.com";
    public static final String URL_OM_API = "https://api.orange.com";
}
