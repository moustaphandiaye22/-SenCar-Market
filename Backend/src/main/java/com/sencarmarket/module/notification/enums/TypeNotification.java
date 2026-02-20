package com.sencarmarket.module.notification.enums;

/**
 * Énumération des types de notifications système (Module 12)
 */
public enum TypeNotification {
    // Réservation
    RESERVATION,
    RESERVATION_CONFIRMEE,
    RESERVATION_ANNULEE,
    RESERVATION_TERMINEE,
    
    // Paiement
    PAIEMENT,
    PAIEMENT_RECU,
    PAIEMENT_ECHEC,
    RETRAIT,
    
    // Message
    MESSAGE,
    NOUVEAU_MESSAGE,
    
    // Abonnement
    ABONNEMENT,
    SOUSCRIPTION_ACCEPTEE,
    SOUSCRIPTION_EXPIRE,
    ABONNEMENT_ACTIF,
    
    // Boost
    BOOST,
    BOOST_TERMINEE,
    BOOST_DEBUT,
    
    // Trade-In
    TRADE_IN,
    TRADE_IN_ACCEPTE,
    TRADE_IN_REJETE,
    
    // Certification
    CERTIFICATION,
    CERTIFICATION_APPROUVEE,
    CERTIFICATION_REJETEE,
    
    // Assurance
    ASSURANCE,
    ASSURANCE_SOUSCRITE,
    ASSURANCE_EXPIRE,
    
    // Système
    SYSTEM,
    MARKETING
}
