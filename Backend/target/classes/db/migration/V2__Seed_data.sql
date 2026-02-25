-- V2__Seed_data.sql
-- Sen-Car Market - Donnees initiales

-- ============================================
-- TYPES D'UTILISATEURS (ROLES)
-- ============================================
INSERT INTO type_utilisateur (id, nom, description) VALUES
('00000000-0000-0000-0000-000000000001', 'UTILISATEUR', 'Utilisateur lambda'),
('00000000-0000-0000-0000-000000000002', 'ACHETEUR', 'Peut acheter et payer'),
('00000000-0000-0000-0000-000000000003', 'VENDEUR', 'Peut publier des vehicules'),
('00000000-0000-0000-0000-000000000004', 'CONCESSIONNAIRE', 'Acces pro concessionnaire'),
('00000000-0000-0000-0000-000000000005', 'LOCATAIRE', 'Peut reserver des locations'),
('00000000-0000-0000-0000-000000000006', 'PROPRIETAIRE_LOUEUR', 'Peut publier des locations'),
('00000000-0000-0000-0000-000000000007', 'COMPAGNIE_ASSURANCE', 'Compagnie assurance partenaire'),
('00000000-0000-0000-0000-000000000008', 'INSPECTEUR', 'Inspecteur certification'),
('00000000-0000-0000-0000-000000000009', 'GARAGE', 'Garage partenaire'),
('00000000-0000-0000-0000-00000000000a', 'PARTENAIRE_FINANCIER', 'Partenaire financier'),
('00000000-0000-0000-0000-00000000000b', 'ADMIN', 'Administrateur'),
('00000000-0000-0000-0000-00000000000c', 'MODERATEUR', 'Moderateur signalements'),
('00000000-0000-0000-0000-00000000000d', 'SUPER_ADMIN', 'Super administrateur')
ON CONFLICT (nom) DO NOTHING;

-- ============================================
-- STATUTS VEHICULES
-- ============================================
INSERT INTO statut_vehicule (id, nom, description) VALUES
('10000000-0000-0000-0000-000000000001', 'BROUILLON', 'Vehicule en cours de creation'),
('10000000-0000-0000-0000-000000000002', 'PUBLIE', 'Vehicule publie et visible'),
('10000000-0000-0000-0000-000000000003', 'VENDU', 'Vehicule vendu'),
('10000000-0000-0000-0000-000000000004', 'RESERVE', 'Vehicule reserve'),
('10000000-0000-0000-0000-000000000005', 'SUPPRIME', 'Vehicule supprime')
ON CONFLICT (nom) DO NOTHING;

-- ============================================
-- TYPES CARBURANTS
-- ============================================
INSERT INTO carburant (id, nom, description) VALUES
('20000000-0000-0000-0000-000000000001', 'ESSENCE', 'Vehicule a essence'),
('20000000-0000-0000-0000-000000000002', 'DIESEL', 'Vehicule diesel'),
('20000000-0000-0000-0000-000000000003', 'ELECTRIQUE', 'Vehicule electrique'),
('20000000-0000-0000-0000-000000000004', 'HYBRIDE', 'Vehicule hybride'),
('20000000-0000-0000-0000-000000000005', 'GPL', 'Vehicule GPL'),
('20000000-0000-0000-0000-000000000006', 'AUTRE', 'Autre type de carburant')
ON CONFLICT (nom) DO NOTHING;

-- ============================================
-- TYPES BOITE DE VITESSES
-- ============================================
INSERT INTO boite_vitesse (id, nom, type) VALUES
('30000000-0000-0000-0000-000000000001', 'MANUELLE', 'Manuelle'),
('30000000-0000-0000-0000-000000000002', 'AUTOMATIQUE', 'Automatique'),
('30000000-0000-0000-0000-000000000003', 'SEMI_AUTO', 'Semi-automatique')
ON CONFLICT (nom) DO NOTHING;

-- ============================================
-- MARQUES VEHICULES
-- ============================================
INSERT INTO marque (id, nom, logo_url, pays_origine) VALUES
('40000000-0000-0000-0000-000000000001', 'TOYOTA', NULL, 'Japon'),
('40000000-0000-0000-0000-000000000002', 'HONDA', NULL, 'Japon'),
('40000000-0000-0000-0000-000000000003', 'HYUNDAI', NULL, 'Coree du Sud'),
('40000000-0000-0000-0000-000000000004', 'KIA', NULL, 'Coree du Sud'),
('40000000-0000-0000-0000-000000000005', 'PEUGEOT', NULL, 'France'),
('40000000-0000-0000-0000-000000000006', 'RENAULT', NULL, 'France')
ON CONFLICT (nom) DO NOTHING;

-- ============================================
-- MODELES VEHICULES
-- ============================================
INSERT INTO modele (id, marque_id, nom, annee_min, annee_max, categorie) VALUES
('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Toyota Corolla', 2015, 2026, 'Berline'),
('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', 'Toyota RAV4', 2015, 2026, 'SUV'),
('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000002', 'Honda Civic', 2015, 2026, 'Berline'),
('50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000003', 'Hyundai Tucson', 2015, 2026, 'SUV'),
('50000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000005', 'Peugeot 3008', 2015, 2026, 'SUV'),
('50000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000006', 'Renault Duster', 2015, 2026, 'SUV')
ON CONFLICT DO NOTHING;

-- ============================================
-- SERVICES GARAGE
-- ============================================
INSERT INTO service_garage (id, nom, description, categorie) VALUES
('60000000-0000-0000-0000-000000000001', 'Vidange', 'Vidange moteur et filtre', 'Entretien'),
('60000000-0000-0000-0000-000000000002', 'Pneumatiques', 'Changement et equilibrage', 'Pneumatique'),
('60000000-0000-0000-0000-000000000003', 'Freinage', 'Controle et remplacement freins', 'Securite'),
('60000000-0000-0000-0000-000000000004', 'Diagnostic', 'Diagnostic electronique', 'Diagnostic')
ON CONFLICT DO NOTHING;

-- ============================================
-- ABONNEMENTS
-- ============================================
INSERT INTO abonnement (id, nom, description, type, duree_jours, prix, nombre_vehicules_max, nombre_photos_max, is_boost_inclus, is_actif) VALUES
('70000000-0000-0000-0000-000000000001', 'BASIC', 'Plan basique', 'PARTICULIER', 30, 5000.00, 3, 5, FALSE, TRUE),
('70000000-0000-0000-0000-000000000002', 'PREMIUM', 'Plan premium', 'PARTICULIER', 30, 15000.00, 10, 15, TRUE, TRUE),
('70000000-0000-0000-0000-000000000003', 'PRO', 'Plan professionnel', 'PROFESSIONNEL', 30, 50000.00, 100, 30, TRUE, TRUE)
ON CONFLICT DO NOTHING;
