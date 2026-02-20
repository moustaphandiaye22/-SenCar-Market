package com.sencarmarket.module.notification.enums;

/**
 * Énumération des motifs de signalement
 */
public enum MotifSignalement {
    // Contenu inapproprié
    CONTENU_INAPPROPRIE,
    FAKE_ANNONCE,
    PRIX_TROMPEUR,
    
    // Comportement
    HARCELEMENT,
    FRAUDE,
    ARNAQUE,
    
    // Qualité
    PHOTO_TROMPEUSE,
    DESCRIPTION_INCORRECTE,
    VEHICULE_ENDOMMAGE,
    
    // Spam
    SPAM,
    MULTI_POST,
    
    // Autres
    AUTRE
}
