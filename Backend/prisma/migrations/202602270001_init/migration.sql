-- CreateEnum
CREATE TYPE "OtpType" AS ENUM ('INSCRIPTION', 'CONNEXION', 'MOT_DE_PASSE_OUBLIE', 'VERIFICATION_EMAIL', 'VERIFICATION_TELEPHONE');

-- CreateEnum
CREATE TYPE "TypeAvis" AS ENUM ('ACHAT_VEHICULE', 'LOCATION_VEHICULE', 'SERVICE_GARAGE', 'VENDEUR', 'ACHETEUR');

-- CreateEnum
CREATE TYPE "StatutAvis" AS ENUM ('EN_ATTENTE', 'PUBLIE', 'SIGNALEE', 'SUPPRIMEE');

-- CreateEnum
CREATE TYPE "StatutValidationGarage" AS ENUM ('EN_ATTENTE', 'ACTIF', 'SUSPENDU', 'REJET');

-- CreateEnum
CREATE TYPE "CategorieServiceGarage" AS ENUM ('ENTRETIEN', 'REPARATION', 'DIAGNOSTIC', 'CARROSSERIE', 'AUTRE');

-- CreateEnum
CREATE TYPE "TypeAssurance" AS ENUM ('RESPONSABILITE_CIVILE', 'TOUS_RISQUES', 'VOL', 'INCENDIE', 'BRIS_DE_GLACE', 'ASSISTANCE', 'PROTECTION_JURIDIQUE');

-- CreateEnum
CREATE TYPE "StatutAssurance" AS ENUM ('ACTIVE', 'EXPIREE', 'ANNULEE', 'EN_ATTENTE', 'SUSPENDUE', 'PAYEE');

-- CreateEnum
CREATE TYPE "StatutTradeIn" AS ENUM ('EN_ATTENTE', 'EN_COURS_EVALUATION', 'EVALUATION_TERMINEE', 'ACCEPTE', 'REJETEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "EtatVehiculeTradeIn" AS ENUM ('excellent', 'bon', 'moyen', 'mauvais');

-- CreateEnum
CREATE TYPE "StatutDemandeCertification" AS ENUM ('EN_ATTENTE', 'PAYEE', 'INSPECTION_PROGRAMMEE', 'INSPECTE', 'CERTIFIEE', 'REJETEE');

-- CreateEnum
CREATE TYPE "ResultatInspection" AS ENUM ('EN_COURS', 'REUSSI', 'ECHEC', 'A_REVISER');

-- CreateEnum
CREATE TYPE "EtatVehiculeInspection" AS ENUM ('BON', 'MOYEN', 'MAUVAIS', 'NON_VERIFIE');

-- CreateEnum
CREATE TYPE "StatutReservation" AS ENUM ('ACTIF', 'INACTIF', 'EN_ATTENTE', 'CONFIRME', 'ANNULE', 'TERMINE', 'EN_COURS');

-- CreateEnum
CREATE TYPE "TypePaiement" AS ENUM ('WAVE', 'ORANGE_MONEY', 'FREE_MONEY', 'CARTE_BANCAIRE', 'ESCROW');

-- CreateEnum
CREATE TYPE "StatutPaiement" AS ENUM ('EN_ATTENTE', 'EN_COURS', 'CONFIRME', 'ECHOUE', 'REMBOURSE', 'ANNULE');

-- CreateEnum
CREATE TYPE "TypeTransaction" AS ENUM ('CREDIT', 'DEBIT', 'RETRAIT', 'REMBOURSEMENT', 'COMMISSION', 'ESCROW_DEPOSIT', 'ESCROW_RELEASE', 'ESCROW_REFUND');

-- CreateEnum
CREATE TYPE "StatutTransaction" AS ENUM ('EN_ATTENTE', 'EN_COURS', 'CONFIRMEE', 'ECHOUEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "TypeAbonnement" AS ENUM ('BASIC', 'PREMIUM', 'PROFESSIONNEL', 'ENTREPRISE');

-- CreateEnum
CREATE TYPE "StatutAbonnement" AS ENUM ('ACTIF', 'EXPIRE', 'ANNULE', 'EN_ATTENTE');

-- CreateEnum
CREATE TYPE "TypeConversation" AS ENUM ('DIRECT', 'GROUP');

-- CreateEnum
CREATE TYPE "TypeMessage" AS ENUM ('TEXTE', 'IMAGE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "TypeNotification" AS ENUM ('RESERVATION', 'RESERVATION_CONFIRMEE', 'RESERVATION_ANNULEE', 'RESERVATION_TERMINEE', 'PAIEMENT', 'PAIEMENT_RECU', 'PAIEMENT_ECHEC', 'RETRAIT', 'MESSAGE', 'NOUVEAU_MESSAGE', 'ABONNEMENT', 'SOUSCRIPTION_ACCEPTEE', 'SOUSCRIPTION_EXPIRE', 'ABONNEMENT_ACTIF', 'BOOST', 'BOOST_TERMINEE', 'BOOST_DEBUT', 'TRADE_IN', 'TRADE_IN_ACCEPTE', 'TRADE_IN_REJETE', 'CERTIFICATION', 'CERTIFICATION_APPROUVEE', 'CERTIFICATION_REJETEE', 'ASSURANCE', 'ASSURANCE_SOUSCRITE', 'ASSURANCE_EXPIRE', 'SYSTEM', 'MARKETING');

-- CreateEnum
CREATE TYPE "TypeEntiteSignalable" AS ENUM ('ANNONCE', 'UTILISATEUR', 'MESSAGE', 'AVIS', 'VEHICULE', 'COMMENTAIRE');

-- CreateEnum
CREATE TYPE "MotifSignalement" AS ENUM ('CONTENU_INAPPROPRIE', 'FAKE_ANNONCE', 'PRIX_TROMPEUR', 'HARCELEMENT', 'FRAUDE', 'ARNAQUE', 'PHOTO_TROMPEUSE', 'DESCRIPTION_INCORRECTE', 'VEHICULE_ENDOMMAGE', 'SPAM', 'MULTI_POST', 'AUTRE');

-- CreateEnum
CREATE TYPE "StatutTraitementSignalement" AS ENUM ('EN_ATTENTE', 'EN_COURS', 'TRAITE', 'REJETE', 'RESOLU');

-- CreateTable
CREATE TABLE "type_utilisateur" (
    "id" UUID NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "description" TEXT,

    CONSTRAINT "type_utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilisateur" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "telephone" VARCHAR(20) NOT NULL,
    "mot_de_passe_hash" VARCHAR(255) NOT NULL,
    "prenom" VARCHAR(100),
    "nom" VARCHAR(100),
    "photo_profil_url" VARCHAR(500),
    "email_verifie" BOOLEAN DEFAULT false,
    "telephone_verifie" BOOLEAN DEFAULT false,
    "note_moyenne" DECIMAL(3,2),
    "nombre_total_avis" INTEGER DEFAULT 0,
    "double_auth_active" BOOLEAN DEFAULT false,
    "type_utilisateur_id" UUID,
    "statut_verification" VARCHAR(50),
    "derniere_connexion" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_code" (
    "id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "code" VARCHAR(6) NOT NULL,
    "type" "OtpType" NOT NULL,
    "expiration" TIMESTAMP(3) NOT NULL,
    "utilise" BOOLEAN NOT NULL DEFAULT false,
    "tentatives" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marque" (
    "id" UUID NOT NULL,
    "nom" VARCHAR(100),

    CONSTRAINT "marque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modele" (
    "id" UUID NOT NULL,
    "marque_id" UUID,
    "nom" VARCHAR(100),

    CONSTRAINT "modele_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carburant" (
    "id" UUID NOT NULL,
    "nom" VARCHAR(50),

    CONSTRAINT "carburant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boite_vitesse" (
    "id" UUID NOT NULL,
    "nom" VARCHAR(50),

    CONSTRAINT "boite_vitesse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicule" (
    "id" UUID NOT NULL,
    "proprietaire_id" UUID NOT NULL,
    "marque_id" UUID,
    "modele_id" UUID,
    "annee_fabrication" INTEGER,
    "kilometrage" INTEGER,
    "carburant_id" UUID,
    "boite_vitesse_id" UUID,
    "couleur" VARCHAR(50),
    "prix_vente" DECIMAL(12,2),
    "description" TEXT,
    "numero_vin" TEXT,
    "immatriculation" TEXT,
    "titre" TEXT,
    "nombre_portes" INTEGER,
    "nombre_places" INTEGER,
    "cylindree" TEXT,
    "puissance_fiscale" TEXT,
    "est_garantie" BOOLEAN,
    "garantie_mois" INTEGER,
    "published_at" TIMESTAMP(3),
    "prix_negociable" BOOLEAN,
    "certifie" BOOLEAN,
    "statut" VARCHAR(50) NOT NULL,
    "est_boost" BOOLEAN,
    "boost_debut" TIMESTAMP(3),
    "boost_fin" TIMESTAMP(3),
    "vues" INTEGER,
    "nombre_favoris" INTEGER,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "vehicule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo_vehicule" (
    "id" UUID NOT NULL,
    "vehicule_id" UUID NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "est_principale" BOOLEAN,
    "ordre" INTEGER,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photo_vehicule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avis" (
    "id" UUID NOT NULL,
    "auteur_id" UUID NOT NULL,
    "cible_utilisateur_id" UUID,
    "vehicule_id" UUID,
    "garage_id" UUID,
    "type_avis" "TypeAvis",
    "transaction_id" UUID NOT NULL,
    "note" INTEGER NOT NULL,
    "commentaire" TEXT,
    "statut" "StatutAvis",
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "garage" (
    "id" UUID NOT NULL,
    "nom" VARCHAR(255) NOT NULL,
    "adresse" VARCHAR(500) NOT NULL,
    "telephone" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255),
    "description" TEXT,
    "horaires_ouverture" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "ville" VARCHAR(255),
    "pays" VARCHAR(255),
    "logo_url" VARCHAR(500),
    "statut_validation" "StatutValidationGarage",
    "commentaire_admin" TEXT,
    "date_validation" TIMESTAMP(3),
    "utilisateur_id" UUID,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "garage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_garage" (
    "id" UUID NOT NULL,
    "nom" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "prix" DECIMAL(12,2),
    "duree_estimee" INTEGER,
    "categorie" "CategorieServiceGarage",
    "actif" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "service_garage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "garage_service_association" (
    "id" UUID NOT NULL,
    "garage_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "prix" DECIMAL(12,2),
    "duree_estimee" INTEGER,
    "actif" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "garage_service_association_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produit_assurance" (
    "id" UUID NOT NULL,
    "nom" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "prix_base" DECIMAL(12,2) NOT NULL,
    "type_assurance" "TypeAssurance" NOT NULL,
    "duree_mois" INTEGER,
    "est_actif" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "produit_assurance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "option_assurance" (
    "id" UUID NOT NULL,
    "produit_assurance_id" UUID NOT NULL,
    "nom" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "prix_supplementaire" DECIMAL(12,2),
    "est_actif" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "option_assurance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "souscription_assurance" (
    "id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "produit_assurance_id" UUID NOT NULL,
    "vehicule_id" UUID NOT NULL,
    "statut" "StatutAssurance" NOT NULL,
    "montant_total" DECIMAL(12,2) NOT NULL,
    "date_debut" TIMESTAMP(3),
    "date_fin" TIMESTAMP(3),
    "numero_contrat" VARCHAR(100),
    "document_url" VARCHAR(500),
    "paiement_id" UUID,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "souscription_assurance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "souscription_options" (
    "souscription_id" UUID NOT NULL,
    "option_id" UUID NOT NULL,

    CONSTRAINT "souscription_options_pkey" PRIMARY KEY ("souscription_id","option_id")
);

-- CreateTable
CREATE TABLE "demande_trade_in" (
    "id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "vehicule_actuel_id" UUID NOT NULL,
    "vehicule_souhaite_id" UUID,
    "statut" "StatutTradeIn" NOT NULL,
    "prix_estime" DECIMAL(12,2),
    "prix_propose" DECIMAL(12,2),
    "kilometrage_actuel" INTEGER,
    "etat_vehicule" "EtatVehiculeTradeIn",
    "date_soumission" TIMESTAMP(3),
    "date_traitement" TIMESTAMP(3),
    "date_evaluation" TIMESTAMP(3),
    "motif_rejet" TEXT,
    "commentaire_admin" TEXT,
    "est_notifie" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "demande_trade_in_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historique_estimation" (
    "id" UUID NOT NULL,
    "vehicule_id" UUID NOT NULL,
    "marque" VARCHAR(100),
    "modele" VARCHAR(100),
    "annee_fabrication" INTEGER,
    "kilometrage" INTEGER,
    "etat_vehicule" "EtatVehiculeTradeIn",
    "prix_estime" DECIMAL(12,2),
    "prix_minimum" DECIMAL(12,2),
    "prix_maximum" DECIMAL(12,2),
    "score_condition" DOUBLE PRECISION,
    "recommandation" TEXT,
    "date_estimation" TIMESTAMP(3),

    CONSTRAINT "historique_estimation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demande_certification" (
    "id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "vehicule_id" UUID NOT NULL,
    "statut" "StatutDemandeCertification" NOT NULL,
    "montant_paiement" DECIMAL(12,2),
    "paiement_id" UUID,
    "inspecteur_id" UUID,
    "date_soumission" TIMESTAMP(3),
    "date_traitement" TIMESTAMP(3),
    "date_inspection" TIMESTAMP(3),
    "motif_rejet" TEXT,
    "badge_certifie_url" VARCHAR(500),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "demande_certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection" (
    "id" UUID NOT NULL,
    "demande_certification_id" UUID NOT NULL,
    "inspecteur_id" UUID NOT NULL,
    "date_inspection" TIMESTAMP(3),
    "resultat" "ResultatInspection",
    "commentaire" TEXT,
    "kilometrage" INTEGER,
    "etat_moteur" "EtatVehiculeInspection",
    "etat_generateur" "EtatVehiculeInspection",
    "etat_freinage" "EtatVehiculeInspection",
    "etat_suspension" "EtatVehiculeInspection",
    "etat_transmission" "EtatVehiculeInspection",
    "etat_pneus" "EtatVehiculeInspection",
    "etat_carrosserie" "EtatVehiculeInspection",
    "etat_interieur" "EtatVehiculeInspection",
    "score_total" INTEGER,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "inspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rapport_inspection" (
    "id" UUID NOT NULL,
    "inspection_id" UUID NOT NULL,
    "url_rapport_pdf" VARCHAR(500),
    "date_generation" TIMESTAMP(3),
    "score_globale" INTEGER,
    "recommendations" TEXT,
    "conclusion" TEXT,
    "est_approuve" BOOLEAN,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "rapport_inspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicule_favori" (
    "id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "vehicule_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicule_favori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "annonce_location" (
    "id" UUID NOT NULL,
    "proprietaire_id" UUID NOT NULL,
    "vehicule_id" UUID,
    "tarif_journalier" DECIMAL(12,2),
    "statut" VARCHAR(50),
    "description" TEXT,
    "conditions" TEXT,
    "caution" DECIMAL(12,2),
    "kilometrage_inclus" INTEGER,
    "tarif_km_supplementaire" DECIMAL(12,2),
    "actif" BOOLEAN,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "annonce_location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_location" (
    "id" UUID NOT NULL,
    "annonce_location_id" UUID NOT NULL,
    "locataire_id" UUID NOT NULL,
    "statut" "StatutReservation",
    "cout_total" DECIMAL(12,2),
    "paiement_id" UUID,
    "date_debut" TIMESTAMP(3),
    "date_fin" TIMESTAMP(3),
    "date_creation" TIMESTAMP(3),
    "motif_annulation" TEXT,

    CONSTRAINT "reservation_location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disponibilite_location" (
    "id" UUID NOT NULL,
    "annonce_location_id" UUID NOT NULL,
    "date" TIMESTAMP(3),
    "est_disponible" BOOLEAN,

    CONSTRAINT "disponibilite_location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historique_statut_reservation" (
    "id" UUID NOT NULL,
    "reservation_id" UUID NOT NULL,
    "ancien_statut_id" UUID,
    "nouveau_statut_id" UUID,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historique_statut_reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portefeuille" (
    "id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "solde" DECIMAL(15,2) DEFAULT 0,
    "solde_bloque" DECIMAL(15,2) DEFAULT 0,
    "is_actif" BOOLEAN DEFAULT true,
    "date_derniere_recharge" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "portefeuille_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_portefeuille" (
    "id" UUID NOT NULL,
    "portefeuille_id" UUID NOT NULL,
    "montant" DECIMAL(15,2) NOT NULL,
    "type_transaction" "TypeTransaction" NOT NULL,
    "statut" "StatutTransaction" NOT NULL,
    "description" TEXT,
    "reference_externe" VARCHAR(100),
    "date_transaction" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_portefeuille_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiement" (
    "id" UUID NOT NULL,
    "utilisateur_id" UUID,
    "reservation_id" UUID,
    "montant" DECIMAL(15,2) NOT NULL,
    "montant_escrow" DECIMAL(15,2),
    "commission" DECIMAL(15,2) DEFAULT 0,
    "methode_paiement" "TypePaiement",
    "statut" "StatutPaiement" NOT NULL,
    "is_escrow" BOOLEAN DEFAULT false,
    "reference_transaction" VARCHAR(100),
    "reference_externe" VARCHAR(100),
    "url_paiement" VARCHAR(500),
    "date_paiement" TIMESTAMP(3),
    "date_expiration" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "paiement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiement_log" (
    "id" UUID NOT NULL,
    "paiement_id" UUID,
    "action" VARCHAR(50) NOT NULL,
    "details" TEXT,
    "date_action" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paiement_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abonnement" (
    "id" UUID NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "prix_mensuel" DECIMAL(12,2),
    "duree_jours" INTEGER,
    "nombre_annonces" INTEGER,
    "est_vedette" BOOLEAN,
    "est_certifie" BOOLEAN,
    "type" "TypeAbonnement",
    "est_actif" BOOLEAN DEFAULT true,
    "avantages" TEXT,
    "prix_annuel" DECIMAL(12,2),
    "nombre_boosts_gratuits" INTEGER,
    "acces_prioritaire" BOOLEAN,
    "support_prioritaire" BOOLEAN,

    CONSTRAINT "abonnement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilisateur_abonnement" (
    "id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "abonnement_id" UUID NOT NULL,
    "date_debut" TIMESTAMP(3),
    "date_fin" TIMESTAMP(3),
    "statut" "StatutAbonnement" NOT NULL,
    "nombre_annonces_utilisees" INTEGER,
    "est_essai_gratuit" BOOLEAN,
    "date_fin_essai" TIMESTAMP(3),

    CONSTRAINT "utilisateur_abonnement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boost_annonce" (
    "id" UUID NOT NULL,
    "annonce_location_id" UUID NOT NULL,
    "date_debut" TIMESTAMP(3),
    "date_fin" TIMESTAMP(3),
    "niveau_boost" VARCHAR(50),

    CONSTRAINT "boost_annonce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "titre" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "type" "TypeNotification" NOT NULL,
    "est_lu" BOOLEAN DEFAULT false,
    "reference_id" UUID,
    "reference_type" VARCHAR(50),
    "date_lecture" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signalement" (
    "id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "type_entite" "TypeEntiteSignalable" NOT NULL,
    "entite_id" UUID NOT NULL,
    "motif" "MotifSignalement" NOT NULL,
    "description" TEXT,
    "statut_traitement" "StatutTraitementSignalement" NOT NULL DEFAULT 'EN_ATTENTE',
    "traite_par" UUID,
    "date_traitement" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signalement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation" (
    "id" UUID NOT NULL,
    "titre" VARCHAR(255),
    "type_conversation" "TypeConversation",
    "annonce_id" UUID,
    "message_epingle_id" UUID,
    "avatar_url" TEXT,
    "cree_par" UUID,
    "est_groupe" BOOLEAN,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_participant" (
    "id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "date_join" TIMESTAMP(3),
    "est_admin" BOOLEAN,
    "est_mute" BOOLEAN,
    "derniere_lecture_date" TIMESTAMP(3),
    "nombre_non_lus" INTEGER,
    "a_rejoint_le" TIMESTAMP(3),

    CONSTRAINT "conversation_participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message" (
    "id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "contenu" TEXT NOT NULL,
    "date_envoi" TIMESTAMP(3),
    "date_lecture" TIMESTAMP(3),
    "est_lu" BOOLEAN,
    "est_supprime" BOOLEAN,
    "est_epingle" BOOLEAN,
    "type_message" "TypeMessage",
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "type_utilisateur_nom_key" ON "type_utilisateur"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_email_key" ON "utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_telephone_key" ON "utilisateur"("telephone");

-- CreateIndex
CREATE INDEX "idx_otp_utilisateur" ON "otp_code"("utilisateur_id", "type");

-- CreateIndex
CREATE INDEX "idx_vehicule_statut_created" ON "vehicule"("statut", "created_at");

-- CreateIndex
CREATE INDEX "idx_avis_cible_utilisateur_statut" ON "avis"("cible_utilisateur_id", "statut");

-- CreateIndex
CREATE INDEX "idx_avis_vehicule_statut" ON "avis"("vehicule_id", "statut");

-- CreateIndex
CREATE INDEX "idx_avis_garage_statut" ON "avis"("garage_id", "statut");

-- CreateIndex
CREATE INDEX "idx_avis_transaction" ON "avis"("transaction_id");

-- CreateIndex
CREATE INDEX "idx_garage_utilisateur" ON "garage"("utilisateur_id");

-- CreateIndex
CREATE INDEX "idx_garage_statut_validation" ON "garage"("statut_validation");

-- CreateIndex
CREATE INDEX "idx_garage_ville_statut" ON "garage"("ville", "statut_validation");

-- CreateIndex
CREATE INDEX "idx_service_garage_actif" ON "service_garage"("actif");

-- CreateIndex
CREATE INDEX "idx_service_garage_categorie_actif" ON "service_garage"("categorie", "actif");

-- CreateIndex
CREATE INDEX "idx_garage_service_garage" ON "garage_service_association"("garage_id");

-- CreateIndex
CREATE INDEX "idx_garage_service_service" ON "garage_service_association"("service_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_garage_service" ON "garage_service_association"("garage_id", "service_id");

-- CreateIndex
CREATE INDEX "idx_produit_assurance_actif" ON "produit_assurance"("est_actif");

-- CreateIndex
CREATE INDEX "idx_option_assurance_produit" ON "option_assurance"("produit_assurance_id");

-- CreateIndex
CREATE INDEX "idx_option_assurance_actif" ON "option_assurance"("est_actif");

-- CreateIndex
CREATE INDEX "idx_souscription_assurance_utilisateur" ON "souscription_assurance"("utilisateur_id");

-- CreateIndex
CREATE INDEX "idx_souscription_assurance_vehicule" ON "souscription_assurance"("vehicule_id");

-- CreateIndex
CREATE INDEX "idx_souscription_assurance_statut" ON "souscription_assurance"("statut");

-- CreateIndex
CREATE INDEX "idx_demande_trade_in_utilisateur" ON "demande_trade_in"("utilisateur_id");

-- CreateIndex
CREATE INDEX "idx_demande_trade_in_statut" ON "demande_trade_in"("statut");

-- CreateIndex
CREATE INDEX "idx_demande_trade_in_notifie" ON "demande_trade_in"("est_notifie");

-- CreateIndex
CREATE INDEX "idx_historique_estimation_vehicule_date" ON "historique_estimation"("vehicule_id", "date_estimation");

-- CreateIndex
CREATE INDEX "idx_demande_certification_utilisateur" ON "demande_certification"("utilisateur_id");

-- CreateIndex
CREATE INDEX "idx_demande_certification_vehicule" ON "demande_certification"("vehicule_id");

-- CreateIndex
CREATE INDEX "idx_demande_certification_statut" ON "demande_certification"("statut");

-- CreateIndex
CREATE INDEX "idx_inspection_demande" ON "inspection"("demande_certification_id");

-- CreateIndex
CREATE INDEX "idx_inspection_inspecteur" ON "inspection"("inspecteur_id");

-- CreateIndex
CREATE UNIQUE INDEX "rapport_inspection_inspection_id_key" ON "rapport_inspection"("inspection_id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicule_favori_utilisateur_id_vehicule_id_key" ON "vehicule_favori"("utilisateur_id", "vehicule_id");

-- CreateIndex
CREATE INDEX "idx_annonce_location_statut_actif" ON "annonce_location"("statut", "actif");

-- CreateIndex
CREATE UNIQUE INDEX "portefeuille_utilisateur_id_key" ON "portefeuille"("utilisateur_id");

-- CreateIndex
CREATE INDEX "idx_transaction_portefeuille" ON "transaction_portefeuille"("portefeuille_id");

-- CreateIndex
CREATE INDEX "idx_paiement_utilisateur" ON "paiement"("utilisateur_id");

-- CreateIndex
CREATE INDEX "idx_paiement_statut" ON "paiement"("statut");

-- CreateIndex
CREATE INDEX "idx_utilisateur_abonnement_utilisateur_id" ON "utilisateur_abonnement"("utilisateur_id");

-- CreateIndex
CREATE INDEX "idx_boost_annonce_location" ON "boost_annonce"("annonce_location_id");

-- CreateIndex
CREATE INDEX "idx_notification_utilisateur" ON "notification"("utilisateur_id");

-- CreateIndex
CREATE INDEX "idx_notification_utilisateur_lu" ON "notification"("utilisateur_id", "est_lu");

-- CreateIndex
CREATE INDEX "idx_signalement_statut" ON "signalement"("statut_traitement");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_participant_conversation_id_utilisateur_id_key" ON "conversation_participant"("conversation_id", "utilisateur_id");

-- CreateIndex
CREATE INDEX "idx_message_conversation_date" ON "message"("conversation_id", "date_envoi");

-- AddForeignKey
ALTER TABLE "utilisateur" ADD CONSTRAINT "utilisateur_type_utilisateur_id_fkey" FOREIGN KEY ("type_utilisateur_id") REFERENCES "type_utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp_code" ADD CONSTRAINT "otp_code_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modele" ADD CONSTRAINT "modele_marque_id_fkey" FOREIGN KEY ("marque_id") REFERENCES "marque"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicule" ADD CONSTRAINT "vehicule_proprietaire_id_fkey" FOREIGN KEY ("proprietaire_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicule" ADD CONSTRAINT "vehicule_marque_id_fkey" FOREIGN KEY ("marque_id") REFERENCES "marque"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicule" ADD CONSTRAINT "vehicule_modele_id_fkey" FOREIGN KEY ("modele_id") REFERENCES "modele"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicule" ADD CONSTRAINT "vehicule_carburant_id_fkey" FOREIGN KEY ("carburant_id") REFERENCES "carburant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicule" ADD CONSTRAINT "vehicule_boite_vitesse_id_fkey" FOREIGN KEY ("boite_vitesse_id") REFERENCES "boite_vitesse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_vehicule" ADD CONSTRAINT "photo_vehicule_vehicule_id_fkey" FOREIGN KEY ("vehicule_id") REFERENCES "vehicule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "avis_auteur_id_fkey" FOREIGN KEY ("auteur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "avis_cible_utilisateur_id_fkey" FOREIGN KEY ("cible_utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "avis_vehicule_id_fkey" FOREIGN KEY ("vehicule_id") REFERENCES "vehicule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "avis_garage_id_fkey" FOREIGN KEY ("garage_id") REFERENCES "garage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "garage" ADD CONSTRAINT "garage_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "garage_service_association" ADD CONSTRAINT "garage_service_association_garage_id_fkey" FOREIGN KEY ("garage_id") REFERENCES "garage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "garage_service_association" ADD CONSTRAINT "garage_service_association_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "service_garage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "option_assurance" ADD CONSTRAINT "option_assurance_produit_assurance_id_fkey" FOREIGN KEY ("produit_assurance_id") REFERENCES "produit_assurance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "souscription_assurance" ADD CONSTRAINT "souscription_assurance_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "souscription_assurance" ADD CONSTRAINT "souscription_assurance_produit_assurance_id_fkey" FOREIGN KEY ("produit_assurance_id") REFERENCES "produit_assurance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "souscription_assurance" ADD CONSTRAINT "souscription_assurance_vehicule_id_fkey" FOREIGN KEY ("vehicule_id") REFERENCES "vehicule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "souscription_assurance" ADD CONSTRAINT "souscription_assurance_paiement_id_fkey" FOREIGN KEY ("paiement_id") REFERENCES "paiement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "souscription_options" ADD CONSTRAINT "souscription_options_souscription_id_fkey" FOREIGN KEY ("souscription_id") REFERENCES "souscription_assurance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "souscription_options" ADD CONSTRAINT "souscription_options_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "option_assurance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande_trade_in" ADD CONSTRAINT "demande_trade_in_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande_trade_in" ADD CONSTRAINT "demande_trade_in_vehicule_actuel_id_fkey" FOREIGN KEY ("vehicule_actuel_id") REFERENCES "vehicule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande_trade_in" ADD CONSTRAINT "demande_trade_in_vehicule_souhaite_id_fkey" FOREIGN KEY ("vehicule_souhaite_id") REFERENCES "vehicule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historique_estimation" ADD CONSTRAINT "historique_estimation_vehicule_id_fkey" FOREIGN KEY ("vehicule_id") REFERENCES "vehicule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande_certification" ADD CONSTRAINT "demande_certification_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande_certification" ADD CONSTRAINT "demande_certification_vehicule_id_fkey" FOREIGN KEY ("vehicule_id") REFERENCES "vehicule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande_certification" ADD CONSTRAINT "demande_certification_paiement_id_fkey" FOREIGN KEY ("paiement_id") REFERENCES "paiement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande_certification" ADD CONSTRAINT "demande_certification_inspecteur_id_fkey" FOREIGN KEY ("inspecteur_id") REFERENCES "utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection" ADD CONSTRAINT "inspection_demande_certification_id_fkey" FOREIGN KEY ("demande_certification_id") REFERENCES "demande_certification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection" ADD CONSTRAINT "inspection_inspecteur_id_fkey" FOREIGN KEY ("inspecteur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rapport_inspection" ADD CONSTRAINT "rapport_inspection_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "inspection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicule_favori" ADD CONSTRAINT "vehicule_favori_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicule_favori" ADD CONSTRAINT "vehicule_favori_vehicule_id_fkey" FOREIGN KEY ("vehicule_id") REFERENCES "vehicule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "annonce_location" ADD CONSTRAINT "annonce_location_proprietaire_id_fkey" FOREIGN KEY ("proprietaire_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "annonce_location" ADD CONSTRAINT "annonce_location_vehicule_id_fkey" FOREIGN KEY ("vehicule_id") REFERENCES "vehicule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_location" ADD CONSTRAINT "reservation_location_annonce_location_id_fkey" FOREIGN KEY ("annonce_location_id") REFERENCES "annonce_location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_location" ADD CONSTRAINT "reservation_location_locataire_id_fkey" FOREIGN KEY ("locataire_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_location" ADD CONSTRAINT "reservation_location_paiement_id_fkey" FOREIGN KEY ("paiement_id") REFERENCES "paiement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilite_location" ADD CONSTRAINT "disponibilite_location_annonce_location_id_fkey" FOREIGN KEY ("annonce_location_id") REFERENCES "annonce_location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historique_statut_reservation" ADD CONSTRAINT "historique_statut_reservation_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservation_location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portefeuille" ADD CONSTRAINT "portefeuille_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_portefeuille" ADD CONSTRAINT "transaction_portefeuille_portefeuille_id_fkey" FOREIGN KEY ("portefeuille_id") REFERENCES "portefeuille"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiement" ADD CONSTRAINT "paiement_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiement" ADD CONSTRAINT "paiement_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservation_location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiement_log" ADD CONSTRAINT "paiement_log_paiement_id_fkey" FOREIGN KEY ("paiement_id") REFERENCES "paiement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateur_abonnement" ADD CONSTRAINT "utilisateur_abonnement_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateur_abonnement" ADD CONSTRAINT "utilisateur_abonnement_abonnement_id_fkey" FOREIGN KEY ("abonnement_id") REFERENCES "abonnement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boost_annonce" ADD CONSTRAINT "boost_annonce_annonce_location_id_fkey" FOREIGN KEY ("annonce_location_id") REFERENCES "annonce_location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalement" ADD CONSTRAINT "signalement_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalement" ADD CONSTRAINT "signalement_traite_par_fkey" FOREIGN KEY ("traite_par") REFERENCES "utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_cree_par_fkey" FOREIGN KEY ("cree_par") REFERENCES "utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_annonce_id_fkey" FOREIGN KEY ("annonce_id") REFERENCES "annonce_location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_message_epingle_id_fkey" FOREIGN KEY ("message_epingle_id") REFERENCES "message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participant" ADD CONSTRAINT "conversation_participant_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participant" ADD CONSTRAINT "conversation_participant_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddCheckConstraints
ALTER TABLE "avis"
  ADD CONSTRAINT "ck_avis_note_range" CHECK ("note" BETWEEN 1 AND 5);

ALTER TABLE "paiement"
  ADD CONSTRAINT "ck_paiement_montants_valides" CHECK (
    "montant" >= 0
    AND ("montant_escrow" IS NULL OR "montant_escrow" >= 0)
    AND ("commission" IS NULL OR "commission" >= 0)
  );

ALTER TABLE "souscription_assurance"
  ADD CONSTRAINT "ck_souscription_assurance_dates" CHECK (
    "date_fin" IS NULL OR "date_debut" IS NULL OR "date_fin" >= "date_debut"
  );

ALTER TABLE "utilisateur_abonnement"
  ADD CONSTRAINT "ck_utilisateur_abonnement_dates" CHECK (
    "date_fin" IS NULL OR "date_debut" IS NULL OR "date_fin" >= "date_debut"
  );

ALTER TABLE "reservation_location"
  ADD CONSTRAINT "ck_reservation_location_dates" CHECK (
    "date_fin" IS NULL OR "date_debut" IS NULL OR "date_fin" >= "date_debut"
  );
