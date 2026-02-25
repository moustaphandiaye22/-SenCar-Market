package com.sencarmarket.module.commun.constants;

public final class AppMessages {

    private AppMessages() {
    }

    public static final String ACCESS_DENIED_RESOURCE = "Accès refusé à cette ressource";
    public static final String ACCESS_DENIED_NOTIFICATIONS = "Accès refusé à ces notifications";

    public static final String USER_NOT_FOUND = "Utilisateur non trouvé";
    public static final String USER_NOT_FOUND_WITH = "Utilisateur non trouve avec: ";
    public static final String USER_NOT_FOUND_FOR_JWT_PREFIX = "Utilisateur introuvable pour le token JWT: ";
    public static final String USER_NOT_AUTHENTICATED = "Utilisateur non authentifié";
    public static final String USER_NOT_AVAILABLE = "Utilisateur introuvable";
    public static final String MESSAGE_NOT_FOUND = "Message non trouvé";
    public static final String PARTICIPANT_NOT_FOUND = "Participant non trouvé";
    public static final String TRANSACTION_NOT_FOUND = "Transaction non trouvée";
    public static final String ANNONCE_NOT_FOUND = "Annonce non trouvée";
    public static final String CONVERSATION_NOT_FOUND = "Conversation non trouvée";
    public static final String AVIS_NOT_FOUND = "Avis non trouvé";
    public static final String TARGET_USER_NOT_FOUND = "Utilisateur cible non trouvé";
    public static final String VEHICULE_NOT_FOUND = "Véhicule non trouvé";
    public static final String GARAGE_NOT_FOUND = "Garage non trouvé";
    public static final String ABONNEMENT_NOT_FOUND = "Abonnement non trouvé";
    public static final String NO_ACTIVE_SUBSCRIPTION = "Aucun abonnement actif trouvé";
    public static final String NO_PENDING_SUBSCRIPTION = "Aucune subscription en attente pour cet utilisateur";

    public static final String INVALID_CREDENTIALS = "Identifiants invalides";

    public static final String NOTIFICATION_MARKED_ALL_READ = "Toutes les notifications ont été marquées comme lues";
    public static final String NOTIFICATION_DELETED = "Notification supprimée avec succès";
    public static final String NOTIFICATION_DELETED_ALL = "Toutes les notifications ont été supprimées";

    public static final String ACCESS_DENIED_ANNONCE = "Accès refusé à cette annonce";
    public static final String ACCESS_DENIED_RESERVATION = "Accès refusé à cette réservation";

    public static final String INVALID_TRANSACTION = "Transaction invalide ou expirée";
    public static final String AVIS_ALREADY_EXISTS_FOR_TRANSACTION = "Vous avez déjà laissé un avis pour cette transaction";
    public static final String AVIS_CANNOT_REPORT_SELF = "Vous ne pouvez pas signaler votre propre avis";
    public static final String AVIS_CANNOT_DELETE = "Vous ne pouvez pas supprimer cet avis";
    public static final String AVIS_CANNOT_RATE_SELF = "Vous ne pouvez pas noter votre propre profil";
    public static final String AVIS_TARGET_REQUIRED = "Veuillez specifier une cible (utilisateur, vehicule ou garage)";
    public static final String AVIS_SINGLE_TARGET_REQUIRED = "Veuillez specifier une seule cible";
    public static final String AVIS_TYPE_INVALID_PREFIX = "Type d'avis invalide. Types valides: ";

    public static final String SUBSCRIPTION_ALREADY_ACTIVE = "L'utilisateur a deja un abonnement actif";

    public static final String CERTIFICATION_REQUEST_ALREADY_ACTIVE = "Une demande de certification est déjà en cours pour ce véhicule";
    public static final String CERTIFICATION_PAYMENT_INVALID_STATE = "La demande n'est pas dans un état permettant le paiement";
    public static final String CERTIFICATION_ASSIGN_INSPECTOR_REQUIRES_PAID = "La demande doit être payée avant d'assigner un inspecteur";
    public static final String CERTIFICATION_ONLY_PENDING_UPDATE = "Seules les demandes en attente peuvent être modifiées";
    public static final String CERTIFICATION_CANNOT_DELETE_CERTIFIED = "Impossible de supprimer une demande certifiée";
    public static final String CERTIFICATION_REQUIRES_SCHEDULED_INSPECTION = "La demande doit être programmée pour l'inspection";
    public static final String CERTIFICATION_CANNOT_UPDATE_FINISHED_INSPECTION = "Impossible de modifier une inspection terminée";
    public static final String CERTIFICATION_REQUIRES_CERTIFIED = "La demande doit être certifiée pour générer un badge";
    public static final String CERTIFICATION_CANNOT_MODIFY_FINAL_STATE = "Impossible de modifier le statut d'une demande certifiee ou rejetee";
    public static final String CERTIFICATION_STATUS_TRANSITION_INVALID_PREFIX = "Transition de statut invalide: ";

    public static final String TRADEIN_ONLY_PENDING_UPDATE = "Seules les demandes en attente peuvent être modifiées";
    public static final String TRADEIN_CANNOT_DELETE_ACCEPTED = "Impossible de supprimer une demande acceptée";
    public static final String TRADEIN_STATUS_TRANSITION_INVALID_PREFIX = "Transition invalide: ";
    public static final String TRADEIN_CANNOT_MODIFY_FINAL_PREFIX = "Impossible de modifier le statut d'une demande ";

    public static final String PAIEMENT_STATUS_REQUIRED = "Le statut de paiement est obligatoire";
    public static final String PAIEMENT_STATUS_INVALID_PREFIX = "Statut de paiement invalide: ";
    public static final String PAIEMENT_REFUND_ONLY_CONFIRMED = "Seules les transactions confirmées peuvent être remboursées";

    public static final String WALLET_INSUFFICIENT_BALANCE_OPERATION = "Solde insuffisant pour effectuer cette opération";
    public static final String WALLET_INSUFFICIENT_BALANCE_WITHDRAW = "Solde insuffisant pour effectuer ce retrait";
    public static final String WALLET_INSUFFICIENT_BALANCE_ESCROW = "Solde insuffisant pour bloquer les fonds escrow";

    public static final String RESERVATION_VEHICULE_NOT_AVAILABLE = "Le véhicule n'est pas disponible pour les dates sélectionnées";
    public static final String RESERVATION_INVALID_DATE_ORDER = "La date de début doit être antérieure à la date de fin";
    public static final String RESERVATION_START_DATE_PAST = "La date de début ne peut pas être dans le passé";
    public static final String RESERVATION_STATUS_REQUIRED = "Le statut ne peut pas être nul ou vide";

    public static final String GARAGE_STATUS_ACTIVE_ONLY_SUSPEND = "Impossible de modifier le statut d'un garage actif sauf pour suspendre";
    public static final String GARAGE_STATUS_REJECTED_SUSPENDED_ONLY_REACTIVATE = "Un garage rejete ou suspendu ne peut etre que reactive";
    public static final String GARAGE_SERVICE_ALREADY_ASSOCIATED = "Ce service est déjà associé à ce garage";

    public static final String MESSAGERIE_DIRECT_CONVERSATION_EXISTS = "Une conversation directe existe déjà";
    public static final String MESSAGERIE_PARTICIPANT_ALREADY_EXISTS = "L'utilisateur est déjà participant";
    public static final String MESSAGERIE_NOT_PARTICIPANT = "Vous n'etes pas participant a cette conversation";
    public static final String MESSAGERIE_ADMIN_REQUIRED = "Seul un admin peut effectuer cette action";
    public static final String MESSAGERIE_CANNOT_DELETE_MESSAGE = "Vous ne pouvez pas supprimer ce message";
    public static final String MESSAGERIE_CANNOT_LEAVE_DIRECT = "Vous ne pouvez pas quitter une conversation directe";
    public static final String MESSAGERIE_LAST_ADMIN_CANNOT_LEAVE = "Vous etes le dernier admin, transferez le role avant de quitter";
    public static final String MESSAGERIE_ONLY_CONVERSATION_ADMIN_CAN_MODIFY = "Seul un admin de conversation peut modifier les participants";
    public static final String JWT_INVALID = "Token JWT invalide";
    public static final String JWT_INVALID_SUBJECT = "Token JWT invalide: subject absent";
    public static final String AUTHORIZATION_HEADER_REQUIRED = "Authorization header required";
    public static final String AUTHENTICATION_FAILED_PREFIX = "Authentication failed: ";

    public static final String SIGNALMENT_ALREADY_PROCESSED = "Ce signalement a déjà été traité";
    public static final String SIGNALMENT_CANNOT_CREATE_FOR_OTHER = "Vous ne pouvez pas créer un signalement pour un autre utilisateur";

    public static final String OWNER_REQUIRED = "Vous n'etes pas proprietaire de cette ressource";

    public static final String OTP_INVALID_OR_EXPIRED = "Code OTP invalide ou expiré";
    public static final String OTP_MAX_ATTEMPTS_REACHED = "Nombre de tentatives maximum atteint. Veuillez demander un nouveau code.";
    public static final String OTP_INCORRECT = "Code OTP incorrect";

    public static final String REGISTRATION_EMAIL_EXISTS = "L'email existe déjà. Veuillez utiliser un autre email.";
    public static final String REGISTRATION_PHONE_EXISTS = "Le numéro de téléphone existe déjà. Veuillez utiliser un autre numéro.";
    public static final String REGISTRATION_USER_TYPE_REQUIRED = "Le type d'utilisateur est obligatoire";
    public static final String REGISTRATION_RESTRICTED_TYPE = "Vous ne pouvez pas vous inscrire avec ce type de compte. Veuillez contacter l'administrateur.";
    public static final String REGISTRATION_INVALID_TYPE_PREFIX = "Type d'utilisateur invalide. Les types valides sont: ";
    public static final String REGISTRATION_SYSTEM_INVALID_TYPE = "Erreur système: type d'utilisateur invalide";
    public static final String AUTH_REFRESH_TOKEN_INVALID = "Le refresh token est invalide ou a expiré";
    public static final String AUTH_PHONE_ALREADY_USED = "Ce numéro de téléphone est déjà utilisé par un autre utilisateur";
    public static final String AUTH_CURRENT_PASSWORD_INVALID = "Le mot de passe actuel est incorrect";

    public static final String PAYMENT_FILE_UPLOAD_ERROR_PREFIX = "Erreur lors de l'upload du fichier: ";
    public static final String ASSURANCE_PAYMENT_PROCESS_INVALID_PREFIX = "Impossible de traiter le paiement. Le statut actuel est : ";
    public static final String ASSURANCE_PAYMENT_PROCESS_INVALID_SUFFIX = ". Seul le statut EN_ATTENTE permet un paiement.";
    public static final String ASSURANCE_CONTRACT_REQUIRES_PAYMENT = "Impossible de generer le contrat. Le paiement doit etre confirme avant la generation du contrat.";

    public static String transitionMessage(String prefix, Object from, Object to) {
        return prefix + from + " -> " + to;
    }

    public static String concat(String prefix, Object value) {
        return prefix + value;
    }
}
