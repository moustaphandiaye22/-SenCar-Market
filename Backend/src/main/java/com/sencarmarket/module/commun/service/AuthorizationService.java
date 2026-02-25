package com.sencarmarket.module.commun.service;

import com.sencarmarket.module.commun.constants.AppMessages;
import com.sencarmarket.module.commun.exception.UnauthorizedAccessException;
import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.utilisateur.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.UUID;

/**
 * Service centralise pour la gestion des autorisations
 * Verifie les roles et les droits de propriete
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthorizationService {

    private final UtilisateurRepository utilisateurRepository;

    // Roles qui peuvent creer des vehicules
    private static final String[] ROLES_CAN_CREATE_VEHICULE = {"VENDEUR", "CONCESSIONNAIRE"};
    
    // Roles qui peuvent acheter
    private static final String[] ROLES_CAN_BUY = {"ACHETEUR", "UTILISATEUR"};
    
    // Roles qui peuvent publier des annonces de location
    private static final String[] ROLES_CAN_PUBLISH_RENTAL = {"VENDEUR", "CONCESSIONNAIRE", "PROPRIETAIRE_LOUEUR"};
    
    // Roles qui peuvent reserver
    private static final String[] ROLES_CAN_RENT = {"ACHETEUR", "UTILISATEUR", "LOCATAIRE"};
    
    // Roles qui peuvent creer des garages
    private static final String[] ROLES_CAN_CREATE_GARAGE = {"GARAGE"};
    
    // Roles qui peuvent creer des produits assurance
    private static final String[] ROLES_CAN_CREATE_INSURANCE = {"COMPAGNIE_ASSURANCE"};
    
    // Roles qui peuvent effectuer des inspections
    private static final String[] ROLES_CAN_INSPECT = {"INSPECTEUR"};
    
    // Roles qui peuvent gerer les signalements
    private static final String[] ROLES_CAN_MANAGE_REPORTS = {"ADMIN", "MODERATEUR"};

    /**
     * Verifie si l'utilisateur a un role specifique
     */
    public boolean hasRole(Authentication authentication, String role) {
        if (authentication == null) {
            return false;
        }
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        return authorities.stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_" + role));
    }

    /**
     * Verifie si l'utilisateur a l'un des roles specifies
     */
    public boolean hasAnyRole(Authentication authentication, String... roles) {
        if (authentication == null) {
            return false;
        }
        for (String role : roles) {
            if (hasRole(authentication, role)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Verifie si l'utilisateur peut creer des vehicules
     */
    public void checkCanCreateVehicule(Authentication authentication) {
        checkAnyRoleOrThrow(authentication, "Seuls les vendeurs et concessionnaires peuvent publier des vehicules",
                ROLES_CAN_CREATE_VEHICULE);
    }

    /**
     * Verifie si l'utilisateur peut acheter
     */
    public void checkCanBuy(Authentication authentication) {
        checkAnyRoleOrThrow(authentication, "Vous n'etes pas autorise a effectuer des achats", ROLES_CAN_BUY);
    }

    /**
     * Verifie si l'utilisateur peut publier des locations
     */
    public void checkCanPublishRental(Authentication authentication) {
        checkAnyRoleOrThrow(authentication,
                "Seuls les proprietaires loueurs peuvent publier des annonces de location",
                ROLES_CAN_PUBLISH_RENTAL);
    }

    /**
     * Verifie si l'utilisateur peut reserver
     */
    public void checkCanRent(Authentication authentication) {
        checkAnyRoleOrThrow(authentication, "Vous n'etes pas autorise a reserver des vehicules", ROLES_CAN_RENT);
    }

    /**
     * Verifie si l'utilisateur peut creer un garage
     */
    public void checkCanCreateGarage(Authentication authentication) {
        checkAnyRoleOrThrow(authentication, "Seuls les garages peuvent creer un profil", ROLES_CAN_CREATE_GARAGE);
    }

    /**
     * Verifie si l'utilisateur peut creer des produits assurance
     */
    public void checkCanCreateInsurance(Authentication authentication) {
        checkAnyRoleOrThrow(authentication, "Seules les compagnies d'assurance peuvent creer des produits",
                ROLES_CAN_CREATE_INSURANCE);
    }

    /**
     * Verifie si l'utilisateur peut effectuer des inspections
     */
    public void checkCanInspect(Authentication authentication) {
        checkAnyRoleOrThrow(authentication, "Seuls les inspecteurs peuvent effectuer des inspections",
                ROLES_CAN_INSPECT);
    }

    /**
     * Verifie si l'utilisateur peut gerer les signalements
     */
    public void checkCanManageReports(Authentication authentication) {
        checkAnyRoleOrThrow(authentication,
                "Seuls les administrateurs et moderateurs peuvent gerer les signalements",
                ROLES_CAN_MANAGE_REPORTS);
    }

    /**
     * Verifie si l'utilisateur est proprietaire de la ressource
     */
    public boolean isOwner(Authentication authentication, UUID ownerId) {
        if (authentication == null || ownerId == null) {
            return false;
        }
        
        Utilisateur utilisateur = utilisateurRepository.findByEmail(authentication.getName())
                .orElse(null);
        
        if (utilisateur == null) {
            return false;
        }
        
        return utilisateur.getId().equals(ownerId);
    }

    /**
     * Verifie si l'utilisateur est proprietaire et leve une exception sinon
     */
    public void checkIsOwner(Authentication authentication, UUID ownerId) {
        if (!isOwner(authentication, ownerId)) {
            log.warn("Tentative d'acces non autorise a la ressource par {}", 
                    authentication.getName());
            throw new UnauthorizedAccessException(AppMessages.OWNER_REQUIRED);
        }
    }

    /**
     * Verifie si l'utilisateur peut supprimer un vehicule
     */
    public void checkCanDeleteVehicule(Authentication authentication, UUID vehiculeOwnerId) {
        checkAdminOrOwner(authentication, vehiculeOwnerId, "Vous ne pouvez supprimer que vos propres vehicules");
    }

    /**
     * Verifie si l'utilisateur peut booster un vehicule
     */
    public void checkCanBoostVehicule(Authentication authentication, UUID vehiculeOwnerId) {
        checkAdminOrOwner(authentication, vehiculeOwnerId, "Vous ne pouvez booster que vos propres vehicules");
    }

    /**
     * Retourne l'utilisateur connecte
     */
    public Utilisateur getCurrentUser(Authentication authentication) {
        if (authentication == null) {
            return null;
        }
        return utilisateurRepository.findByEmail(authentication.getName())
                .orElse(null);
    }

    /**
     * Retourne le type d'utilisateur de l'utilisateur connecte
     */
    public String getUserType(Authentication authentication) {
        Utilisateur user = getCurrentUser(authentication);
        if (user == null || user.getTypeUtilisateur() == null) {
            return null;
        }
        return user.getTypeUtilisateur().getNom();
    }

    // ========== OWNERSHIP CHECKS FOR SPECIFIC RESOURCES ==========

    /**
     * Verifie si l'utilisateur peut acceder a un paiement
     * (proprietaire du paiement ou admin)
     */
    public void checkCanAccessPaiement(Authentication authentication, UUID paiementOwnerId) {
        checkAdminOrOwner(authentication, paiementOwnerId, "Vous n'avez pas acces a ce paiement");
    }

    /**
     * Verifie si l'utilisateur peut acceder a un portefeuille
     * (proprietaire du portefeuille ou admin)
     */
    public void checkCanAccessPortefeuille(Authentication authentication, UUID portefeuilleOwnerId) {
        checkAdminOrOwner(authentication, portefeuilleOwnerId, "Vous n'avez pas acces a ce portefeuille");
    }

    /**
     * Verifie si l'utilisateur peut acceder a une conversation
     * (participant a la conversation ou admin)
     */
    public void checkCanAccessConversation(Authentication authentication, UUID conversationId) {
        // Admin peut acceder a toutes les conversations
        if (hasRole(authentication, "ADMIN") || hasRole(authentication, "SUPER_ADMIN")) {
            return;
        }
        
        // Pour les utilisateurs normaux, la verification se fait au niveau du service
        // car il faut verifier la participation a la conversation
        log.debug("Verification d'acces a la conversation {} pour {}", 
                conversationId, authentication.getName());
    }

    /**
     * Verifie si l'utilisateur peut acceder a une notification
     * (proprietaire de la notification ou admin)
     */
    public void checkCanAccessNotification(Authentication authentication, UUID notificationOwnerId) {
        checkAdminOrOwner(authentication, notificationOwnerId, "Vous n'avez pas acces a cette notification");
    }

    /**
     * Verifie si l'utilisateur peut supprimer un message
     * (auteur du message ou admin)
     */
    public void checkCanDeleteMessage(Authentication authentication, UUID messageAuthorId) {
        checkAdminOrOwner(authentication, messageAuthorId, "Vous ne pouvez supprimer que vos propres messages");
    }

    /**
     * Verifie si l'utilisateur peut supprimer un avis
     * (auteur de l'avis ou admin)
     */
    public void checkCanDeleteAvis(Authentication authentication, UUID avisAuthorId) {
        checkAdminOrOwner(authentication, avisAuthorId, "Vous ne pouvez supprimer que vos propres avis");
    }

    /**
     * Verifie si l'utilisateur peut modifier une reservation
     * (locataire ou proprietaire de l'annonce)
     */
    public void checkCanModifyReservation(Authentication authentication, UUID reservationOwnerId) {
        checkAdminOrOwner(authentication, reservationOwnerId, "Vous ne pouvez modifier que vos propres reservations");
    }

    /**
     * Verifie si l'utilisateur peut acceder a un garage
     * (proprietaire du garage ou admin)
     */
    public void checkCanAccessGarage(Authentication authentication, UUID garageOwnerId) {
        checkAdminOrOwner(authentication, garageOwnerId, "Vous n'avez pas acces a ce garage");
    }

    /**
     * Verifie si l'utilisateur peut gerer un abonnement
     * (proprietaire de l'abonnement ou admin)
     */
    public void checkCanManageAbonnement(Authentication authentication, UUID abonnementOwnerId) {
        checkAdminOrOwner(authentication, abonnementOwnerId, "Vous ne pouvez gerer que vos propres abonnements");
    }

    private boolean isAdmin(Authentication authentication) {
        return hasRole(authentication, "ADMIN") || hasRole(authentication, "SUPER_ADMIN");
    }

    private void checkAnyRoleOrThrow(Authentication authentication, String message, String... roles) {
        if (!hasAnyRole(authentication, roles)) {
            if (authentication != null) {
                log.warn("Acces refuse pour utilisateur {}", authentication.getName());
            }
            throw new UnauthorizedAccessException(message);
        }
    }

    private void checkAdminOrOwner(Authentication authentication, UUID ownerId, String message) {
        if (isAdmin(authentication)) {
            return;
        }
        if (!isOwner(authentication, ownerId)) {
            throw new UnauthorizedAccessException(message);
        }
    }
}
