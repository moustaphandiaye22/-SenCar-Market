package com.sencarmarket.module.commun.service;

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
        if (!hasAnyRole(authentication, ROLES_CAN_CREATE_VEHICULE)) {
            log.warn("Utilisateur {} tente de creer un vehicule sans autorisation", 
                    authentication != null ? authentication.getName() : "unknown");
            throw new UnauthorizedAccessException(
                    "Seuls les vendeurs et concessionnaires peuvent publier des vehicules");
        }
    }

    /**
     * Verifie si l'utilisateur peut acheter
     */
    public void checkCanBuy(Authentication authentication) {
        if (!hasAnyRole(authentication, ROLES_CAN_BUY)) {
            throw new UnauthorizedAccessException("Vous n'etes pas autorise a effectuer des achats");
        }
    }

    /**
     * Verifie si l'utilisateur peut publier des locations
     */
    public void checkCanPublishRental(Authentication authentication) {
        if (!hasAnyRole(authentication, ROLES_CAN_PUBLISH_RENTAL)) {
            throw new UnauthorizedAccessException(
                    "Seuls les proprietaires loueurs peuvent publier des annonces de location");
        }
    }

    /**
     * Verifie si l'utilisateur peut reserver
     */
    public void checkCanRent(Authentication authentication) {
        if (!hasAnyRole(authentication, ROLES_CAN_RENT)) {
            throw new UnauthorizedAccessException("Vous n'etes pas autorise a reserver des vehicules");
        }
    }

    /**
     * Verifie si l'utilisateur peut creer un garage
     */
    public void checkCanCreateGarage(Authentication authentication) {
        if (!hasAnyRole(authentication, ROLES_CAN_CREATE_GARAGE)) {
            throw new UnauthorizedAccessException("Seuls les garages peuvent creer un profil");
        }
    }

    /**
     * Verifie si l'utilisateur peut creer des produits assurance
     */
    public void checkCanCreateInsurance(Authentication authentication) {
        if (!hasAnyRole(authentication, ROLES_CAN_CREATE_INSURANCE)) {
            throw new UnauthorizedAccessException(
                    "Seules les compagnies d'assurance peuvent creer des produits");
        }
    }

    /**
     * Verifie si l'utilisateur peut effectuer des inspections
     */
    public void checkCanInspect(Authentication authentication) {
        if (!hasAnyRole(authentication, ROLES_CAN_INSPECT)) {
            throw new UnauthorizedAccessException("Seuls les inspecteurs peuvent effectuer des inspections");
        }
    }

    /**
     * Verifie si l'utilisateur peut gerer les signalements
     */
    public void checkCanManageReports(Authentication authentication) {
        if (!hasAnyRole(authentication, ROLES_CAN_MANAGE_REPORTS)) {
            throw new UnauthorizedAccessException(
                    "Seuls les administrateurs et moderateurs peuvent gerer les signalements");
        }
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
            throw new UnauthorizedAccessException("Vous n'etes pas proprietaire de cette ressource");
        }
    }

    /**
     * Verifie si l'utilisateur peut supprimer un vehicule
     */
    public void checkCanDeleteVehicule(Authentication authentication, UUID vehiculeOwnerId) {
        // Admin peut supprimer n'importe quel vehicule
        if (hasRole(authentication, "ADMIN") || hasRole(authentication, "SUPER_ADMIN")) {
            return;
        }
        
        // Verifier la propriete
        if (!isOwner(authentication, vehiculeOwnerId)) {
            throw new UnauthorizedAccessException(
                    "Vous ne pouvez supprimer que vos propres vehicules");
        }
    }

    /**
     * Verifie si l'utilisateur peut booster un vehicule
     */
    public void checkCanBoostVehicule(Authentication authentication, UUID vehiculeOwnerId) {
        // Admin peut booster n'importe quel vehicule
        if (hasRole(authentication, "ADMIN") || hasRole(authentication, "SUPER_ADMIN")) {
            return;
        }
        
        // Verifier la propriete
        if (!isOwner(authentication, vehiculeOwnerId)) {
            throw new UnauthorizedAccessException(
                    "Vous ne pouvez booster que vos propres vehicules");
        }
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
        // Admin peut acceder a tous les paiements
        if (hasRole(authentication, "ADMIN") || hasRole(authentication, "SUPER_ADMIN")) {
            return;
        }
        
        // Verifier la propriete
        if (!isOwner(authentication, paiementOwnerId)) {
            throw new UnauthorizedAccessException(
                    "Vous n'avez pas acces a ce paiement");
        }
    }

    /**
     * Verifie si l'utilisateur peut acceder a un portefeuille
     * (proprietaire du portefeuille ou admin)
     */
    public void checkCanAccessPortefeuille(Authentication authentication, UUID portefeuilleOwnerId) {
        // Admin peut acceder a tous les portefeuille
        if (hasRole(authentication, "ADMIN") || hasRole(authentication, "SUPER_ADMIN")) {
            return;
        }
        
        // Verifier la propriete
        if (!isOwner(authentication, portefeuilleOwnerId)) {
            throw new UnauthorizedAccessException(
                    "Vous n'avez pas acces a ce portefeuille");
        }
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
        // Admin peut acceder a toutes les notifications
        if (hasRole(authentication, "ADMIN") || hasRole(authentication, "SUPER_ADMIN")) {
            return;
        }
        
        // Verifier la propriete
        if (!isOwner(authentication, notificationOwnerId)) {
            throw new UnauthorizedAccessException(
                    "Vous n'avez pas acces a cette notification");
        }
    }

    /**
     * Verifie si l'utilisateur peut supprimer un message
     * (auteur du message ou admin)
     */
    public void checkCanDeleteMessage(Authentication authentication, UUID messageAuthorId) {
        // Admin peut supprimer tous les messages
        if (hasRole(authentication, "ADMIN") || hasRole(authentication, "SUPER_ADMIN")) {
            return;
        }
        
        // Verifier la propriete
        if (!isOwner(authentication, messageAuthorId)) {
            throw new UnauthorizedAccessException(
                    "Vous ne pouvez supprimer que vos propres messages");
        }
    }

    /**
     * Verifie si l'utilisateur peut supprimer un avis
     * (auteur de l'avis ou admin)
     */
    public void checkCanDeleteAvis(Authentication authentication, UUID avisAuthorId) {
        // Admin peut supprimer tous les avis
        if (hasRole(authentication, "ADMIN") || hasRole(authentication, "SUPER_ADMIN")) {
            return;
        }
        
        // Verifier la propriete
        if (!isOwner(authentication, avisAuthorId)) {
            throw new UnauthorizedAccessException(
                    "Vous ne pouvez supprimer que vos propres avis");
        }
    }

    /**
     * Verifie si l'utilisateur peut modifier une reservation
     * (locataire ou proprietaire de l'annonce)
     */
    public void checkCanModifyReservation(Authentication authentication, UUID reservationOwnerId) {
        // Admin peut modifier toutes les reservations
        if (hasRole(authentication, "ADMIN") || hasRole(authentication, "SUPER_ADMIN")) {
            return;
        }
        
        // Verifier la propriete
        if (!isOwner(authentication, reservationOwnerId)) {
            throw new UnauthorizedAccessException(
                    "Vous ne pouvez modifier que vos propres reservations");
        }
    }

    /**
     * Verifie si l'utilisateur peut acceder a un garage
     * (proprietaire du garage ou admin)
     */
    public void checkCanAccessGarage(Authentication authentication, UUID garageOwnerId) {
        // Admin peut acceder a tous les garages
        if (hasRole(authentication, "ADMIN") || hasRole(authentication, "SUPER_ADMIN")) {
            return;
        }
        
        // Verifier la propriete
        if (!isOwner(authentication, garageOwnerId)) {
            throw new UnauthorizedAccessException(
                    "Vous n'avez pas acces a ce garage");
        }
    }

    /**
     * Verifie si l'utilisateur peut gerer un abonnement
     * (proprietaire de l'abonnement ou admin)
     */
    public void checkCanManageAbonnement(Authentication authentication, UUID abonnementOwnerId) {
        // Admin peut gerer tous les abonnements
        if (hasRole(authentication, "ADMIN") || hasRole(authentication, "SUPER_ADMIN")) {
            return;
        }
        
        // Verifier la propriete
        if (!isOwner(authentication, abonnementOwnerId)) {
            throw new UnauthorizedAccessException(
                    "Vous ne pouvez gerer que vos propres abonnements");
        }
    }
}
