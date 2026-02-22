-- V1__Initial_schema.sql
-- Sen-Car Market - Schema initial

-- ============================================
-- TABLES UTILISATEURS
-- ============================================

-- Type Utilisateur (rôles)
CREATE TABLE type_utilisateur (
    id UUID PRIMARY KEY,
    nom VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- Utilisateur
CREATE TABLE utilisateur (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    telephone VARCHAR(20) NOT NULL UNIQUE,
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    photo_profil_url VARCHAR(500),
    email_verifie BOOLEAN DEFAULT FALSE,
    telephone_verifie BOOLEAN DEFAULT FALSE,
    double_auth_active BOOLEAN DEFAULT FALSE,
    type_utilisateur_id UUID REFERENCES type_utilisateur(id),
    statut_verification VARCHAR(50),
    derniere_connexion TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour performance
CREATE INDEX idx_utilisateur_email ON utilisateur(email);
CREATE INDEX idx_utilisateur_telephone ON utilisateur(telephone);
CREATE INDEX idx_utilisateur_type ON utilisateur(type_utilisateur_id);

-- OTP Code
CREATE TABLE otp_code (
    id UUID PRIMARY KEY,
    utilisateur_id UUID NOT NULL REFERENCES utilisateur(id),
    code VARCHAR(10) NOT NULL,
    type VARCHAR(50) NOT NULL,
    expire_le TIMESTAMP NOT NULL,
    utilise BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_otp_utilisateur ON otp_code(utilisateur_id, type);

-- ============================================
-- TABLES VÉHICULES
-- ============================================

-- Marque véhicule
CREATE TABLE marque (
    id UUID PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    logo_url VARCHAR(500),
    pays_origine VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modèle véhicule
CREATE TABLE modele (
    id UUID PRIMARY KEY,
    marque_id UUID NOT NULL REFERENCES marque(id),
    nom VARCHAR(100) NOT NULL,
    annee_min INTEGER,
    annee_max INTEGER,
    categorie VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_modele_marque ON modele(marque_id);

-- Carburant
CREATE TABLE carburant (
    id UUID PRIMARY KEY,
    nom VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- Boite vitesse
CREATE TABLE boite_vitesse (
    id UUID PRIMARY KEY,
    nom VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(50)
);

-- Statut véhicule
CREATE TABLE statut_vehicule (
    id UUID PRIMARY KEY,
    nom VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- Véhicule
CREATE TABLE vehicule (
    id UUID PRIMARY KEY,
    proprietaire_id UUID NOT NULL REFERENCES utilisateur(id),
    marque_id UUID REFERENCES marque(id),
    modele_id UUID REFERENCES modele(id),
    carburant_id UUID REFERENCES carburant(id),
    boite_vitesse_id UUID REFERENCES boite_vitesse(id),
    statut VARCHAR(50) NOT NULL DEFAULT 'BROUILLON',
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    annee_fabrication INTEGER,
    kilometrage INTEGER,
    prix DECIMAL(15,2),
    prix_negotiable BOOLEAN DEFAULT TRUE,
    couleur VARCHAR(50),
    nombre_portes INTEGER,
    nombre_places INTEGER,
    cylindree VARCHAR(50),
    puissance_fiscale VARCHAR(20),
    vin VARCHAR(50) UNIQUE,
    plaque_immatriculation VARCHAR(20),
    est_garantie BOOLEAN DEFAULT FALSE,
    garantie_mois INTEGER,
    est_certifie BOOLEAN DEFAULT FALSE,
    est_boost BOOLEAN DEFAULT FALSE,
    boost_debut TIMESTAMP,
    boost_fin TIMESTAMP,
    vues INTEGER DEFAULT 0,
    nombre_favoris INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

CREATE INDEX idx_vehicule_proprietaire ON vehicule(proprietaire_id);
CREATE INDEX idx_vehicule_statut ON vehicule(statut);
CREATE INDEX idx_vehicule_marque ON vehicule(marque_id);
CREATE INDEX idx_vehicule_prix ON vehicule(prix);

-- Photo véhicule
CREATE TABLE photo_vehicule (
    id UUID PRIMARY KEY,
    vehicule_id UUID NOT NULL REFERENCES vehicule(id),
    url VARCHAR(500) NOT NULL,
    est_principale BOOLEAN DEFAULT FALSE,
    ordre INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_photo_vehicule ON photo_vehicule(vehicule_id);

-- Équipement véhicule
CREATE TABLE vehicule_equipement (
    id UUID PRIMARY KEY,
    vehicule_id UUID NOT NULL REFERENCES vehicule(id),
    equipement VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    est_present BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_equipement_vehicule ON vehicule_equipement(vehicule_id);

-- Favori véhicule
CREATE TABLE vehicule_favori (
    id UUID PRIMARY KEY,
    utilisateur_id UUID NOT NULL REFERENCES utilisateur(id),
    vehicule_id UUID NOT NULL REFERENCES vehicule(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(utilisateur_id, vehicule_id)
);

CREATE INDEX idx_favori_utilisateur ON vehicule_favori(utilisateur_id);
CREATE INDEX idx_favori_vehicule ON vehicule_favori(vehicule_id);

-- ============================================
-- TABLES PAIEMENTS
-- ============================================

-- Portefeuille
CREATE TABLE portefeuille (
    id UUID PRIMARY KEY,
    utilisateur_id UUID NOT NULL REFERENCES utilisateur(id),
    solde DECIMAL(15,2) DEFAULT 0,
    solde_bloque DECIMAL(15,2) DEFAULT 0,
    is_actif BOOLEAN DEFAULT TRUE,
    date_derniere_recharge TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(utilisateur_id)
);

-- Transaction portefeuille
CREATE TABLE transaction_portefeuille (
    id UUID PRIMARY KEY,
    portefeuille_id UUID NOT NULL REFERENCES portefeuille(id),
    montant DECIMAL(15,2) NOT NULL,
    type_transaction VARCHAR(50) NOT NULL,
    statut VARCHAR(50) NOT NULL,
    description TEXT,
    reference_externe VARCHAR(100),
    date_transaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transaction_portefeuille ON transaction_portefeuille(portefeuille_id);

-- Paiement
CREATE TABLE paiement (
    id UUID PRIMARY KEY,
    utilisateur_id UUID REFERENCES utilisateur(id),
    reservation_id UUID,
    montant DECIMAL(15,2) NOT NULL,
    montant_esrow DECIMAL(15,2),
    commission DECIMAL(15,2) DEFAULT 0,
    methode_paiement VARCHAR(50),
    statut VARCHAR(50) NOT NULL,
    is_escrow BOOLEAN DEFAULT FALSE,
    reference_transaction VARCHAR(100),
    reference_externe VARCHAR(100),
    url_paiement VARCHAR(500),
    date_paiement TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_paiement_utilisateur ON paiement(utilisateur_id);
CREATE INDEX idx_paiement_statut ON paiement(statut);

-- Log paiement
CREATE TABLE paiement_log (
    id UUID PRIMARY KEY,
    paiement_id UUID REFERENCES paiement(id),
    action VARCHAR(50) NOT NULL,
    details TEXT,
    date_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLES NOTIFICATIONS
-- ============================================

-- Notification
CREATE TABLE notification (
    id UUID PRIMARY KEY,
    utilisateur_id UUID NOT NULL REFERENCES utilisateur(id),
    titre VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    est_lu BOOLEAN DEFAULT FALSE,
    reference_id UUID,
    reference_type VARCHAR(50),
    date_lecture TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_utilisateur ON notification(utilisateur_id);

-- Signalement
CREATE TABLE signalement (
    id UUID PRIMARY KEY,
    utilisateur_id UUID NOT NULL REFERENCES utilisateur(id),
    type_entite VARCHAR(50) NOT NULL,
    entite_id UUID NOT NULL,
    motif VARCHAR(100) NOT NULL,
    description TEXT,
    statut_traitement VARCHAR(50) DEFAULT 'EN_ATTENTE',
    traite_par UUID REFERENCES utilisateur(id),
    date_traitement TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_signalement_statut ON signalement(statut_traitement);

-- ============================================
-- TABLES MESSAGERIE
-- ============================================

-- Conversation
CREATE TABLE conversation (
    id UUID PRIMARY KEY,
    titre VARCHAR(255),
    est_groupe BOOLEAN DEFAULT FALSE,
    cree_par UUID REFERENCES utilisateur(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Participant conversation
CREATE TABLE conversation_participant (
    id UUID PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversation(id),
    utilisateur_id UUID NOT NULL REFERENCES utilisateur(id),
    est_admin BOOLEAN DEFAULT FALSE,
    a_rejoint_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(conversation_id, utilisateur_id)
);

-- Message
CREATE TABLE message (
    id UUID PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversation(id),
    auteur_id UUID NOT NULL REFERENCES utilisateur(id),
    contenu TEXT NOT NULL,
    est_supprime BOOLEAN DEFAULT FALSE,
    est_lu BOOLEAN DEFAULT FALSE,
    date_lecture TIMESTAMP,
    est_epingle BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_message_conversation ON message(conversation_id);
CREATE INDEX idx_message_auteur ON message(auteur_id);

-- ============================================
-- TABLES LOCATIONS
-- ============================================

-- Annonce location
CREATE TABLE annonce_location (
    id UUID PRIMARY KEY,
    proprietaire_id UUID NOT NULL REFERENCES utilisateur(id),
    vehicule_id UUID REFERENCES vehicule(id),
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    prix_jour DECIMAL(15,2) NOT NULL,
    caution DECIMAL(15,2) NOT NULL,
    is_disponible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_annonce_proprietaire ON annonce_location(proprietaire_id);

-- Disponibilité location
CREATE TABLE disponibilite_location (
    id UUID PRIMARY KEY,
    annonce_id UUID NOT NULL REFERENCES annonce_location(id),
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    est_disponible BOOLEAN DEFAULT TRUE
);

-- Réservation location
CREATE TABLE reservation_location (
    id UUID PRIMARY KEY,
    annonce_id UUID NOT NULL REFERENCES annonce_location(id),
    locataire_id UUID NOT NULL REFERENCES utilisateur(id),
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    prix_total DECIMAL(15,2) NOT NULL,
    statut VARCHAR(50) DEFAULT 'EN_ATTENTE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reservation_annonce ON reservation_location(annonce_id);
CREATE INDEX idx_reservation_locataire ON reservation_location(locataire_id);

-- ============================================
-- TABLES ASSURANCE
-- ============================================

-- Produit assurance
CREATE TABLE produit_assurance (
    id UUID PRIMARY KEY,
    compagnie_id UUID NOT NULL REFERENCES utilisateur(id),
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    type_assurance VARCHAR(50),
    couverture TEXT,
    prix_min DECIMAL(15,2),
    prix_max DECIMAL(15,2),
    is_actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Option assurance
CREATE TABLE option_assurance (
    id UUID PRIMARY KEY,
    produit_id UUID NOT NULL REFERENCES produit_assurance(id),
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    supplement_prix DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Souscription assurance
CREATE TABLE souscription_assurance (
    id UUID PRIMARY KEY,
    utilisateur_id UUID NOT NULL REFERENCES utilisateur(id),
    produit_id UUID NOT NULL REFERENCES produit_assurance(id),
    vehicule_id UUID REFERENCES vehicule(id),
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    prix_total DECIMAL(15,2) NOT NULL,
    statut VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLES GARAGE
-- ============================================

-- Garage
CREATE TABLE garage (
    id UUID PRIMARY KEY,
    utilisateur_id UUID NOT NULL REFERENCES utilisateur(id),
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    adresse VARCHAR(500),
    telephone VARCHAR(20),
    email VARCHAR(255),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    horaires_ouverture VARCHAR(255),
    is_verifie BOOLEAN DEFAULT FALSE,
    note_moyenne DECIMAL(3,2) DEFAULT 0,
    nombre_avis INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service garage
CREATE TABLE service_garage (
    id UUID PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    categorie VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Association garage-service
CREATE TABLE garage_service_association (
    id UUID PRIMARY KEY,
    garage_id UUID NOT NULL REFERENCES garage(id),
    service_id UUID NOT NULL REFERENCES service_garage(id),
    prix DECIMAL(15,2),
    is_actif BOOLEAN DEFAULT TRUE,
    UNIQUE(garage_id, service_id)
);

-- ============================================
-- TABLES CERTIFICATION
-- ============================================

-- Demande certification
CREATE TABLE demande_certification (
    id UUID PRIMARY KEY,
    vehicule_id UUID NOT NULL REFERENCES vehicule(id),
    demandeur_id UUID NOT NULL REFERENCES utilisateur(id),
    inspecteur_id UUID REFERENCES utilisateur(id),
    statut VARCHAR(50) DEFAULT 'EN_ATTENTE',
    date_soumission TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_inspection TIMESTAMP,
    date_traitement TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inspection
CREATE TABLE inspection (
    id UUID PRIMARY KEY,
    demande_id UUID NOT NULL REFERENCES demande_certification(id),
    inspecteur_id UUID NOT NULL REFERENCES utilisateur(id),
    date_inspection TIMESTAMP NOT NULL,
    lieu VARCHAR(255),
    kilometrage INTEGER,
    etat_general VARCHAR(50),
    recommandation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rapport inspection
CREATE TABLE rapport_inspection (
    id UUID PRIMARY KEY,
    inspection_id UUID NOT NULL REFERENCES inspection(id),
    demande_id UUID NOT NULL REFERENCES demande_certification(id),
    notes_techniques TEXT,
    defauts_constates TEXT,
    recommandations TEXT,
    est_favorable BOOLEAN,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLES ABONNEMENT
-- ============================================

-- Abonnement (plans)
CREATE TABLE abonnement (
    id UUID PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(50),
    duree_jours INTEGER,
    prix DECIMAL(15,2),
    nombre_vehicules_max INTEGER,
    nombre_photos_max INTEGER,
    is_boost_inclus BOOLEAN DEFAULT FALSE,
    is_actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Historique abonnement
CREATE TABLE historique_abonnement (
    id UUID PRIMARY KEY,
    utilisateur_id UUID NOT NULL REFERENCES utilisateur(id),
    abonnement_id UUID REFERENCES abonnement(id),
    date_debut DATE NOT NULL,
    date_fin DATE,
    statut VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Utilisateur abonnement
CREATE TABLE utilisateur_abonnement (
    id UUID PRIMARY KEY,
    utilisateur_id UUID NOT NULL REFERENCES utilisateur(id),
    abonnement_id UUID REFERENCES abonnement(id),
    est_actif BOOLEAN DEFAULT TRUE,
    date_debut DATE NOT NULL,
    date_fin DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Boost annonce
CREATE TABLE boost_annonce (
    id UUID PRIMARY KEY,
    vehicule_id UUID NOT NULL REFERENCES vehicule(id),
    utilisateur_id UUID NOT NULL REFERENCES utilisateur(id),
    date_debut TIMESTAMP NOT NULL,
    date_fin TIMESTAMP NOT NULL,
    prix DECIMAL(15,2) NOT NULL,
    statut VARCHAR(50) DEFAULT 'ACTIF',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLES AVIS
-- ============================================

-- Avis
CREATE TABLE avis (
    id UUID PRIMARY KEY,
    utilisateur_id UUID NOT NULL REFERENCES utilisateur(id),
    vehicule_id UUID REFERENCES vehicule(id),
    garage_id UUID REFERENCES garage(id),
    note INTEGER NOT NULL CHECK (note >= 1 AND note <= 5),
    commentaire TEXT,
    est_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_avis_vehicule ON avis(vehicule_id);
CREATE INDEX idx_avis_garage ON avis(garage_id);

-- ============================================
-- TABLES TRADE-IN
-- ============================================

-- Demande trade-in
CREATE TABLE demande_trade_in (
    id UUID PRIMARY KEY,
    vehicule_id UUID REFERENCES vehicule(id),
    utilisateur_id UUID NOT NULL REFERENCES utilisateur(id),
    vehicule_souhaite_id UUID REFERENCES vehicule(id),
    prix_propose DECIMAL(15,2),
    statut VARCHAR(50) DEFAULT 'EN_ATTENTE',
    estimation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Historique estimation
CREATE TABLE historique_estimation (
    id UUID PRIMARY KEY,
    demande_id UUID NOT NULL REFERENCES demande_trade_in(id),
    prix_estime DECIMAL(15,2),
    date_estimation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLES AUDIT
-- ============================================

-- Audit log
CREATE TABLE audit_log (
    id UUID PRIMARY KEY,
    utilisateur_id UUID REFERENCES utilisateur(id),
    utilisateur_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    type_entite VARCHAR(50),
    id_entite UUID,
    details TEXT,
    adresse_ip VARCHAR(50),
    user_agent VARCHAR(500),
    statut VARCHAR(20),
    message_erreur TEXT,
    date_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_utilisateur ON audit_log(utilisateur_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_date ON audit_log(date_action);
