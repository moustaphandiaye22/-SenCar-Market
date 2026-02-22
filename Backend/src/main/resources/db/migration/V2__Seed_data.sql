-- V2__Seed_data.sql
-- Sen-Car Market - Données initiales (Seeders)

-- ============================================
-- TYPES D'UTILISATEURS (ROLES)
-- ============================================

INSERT INTO type_utilisateur (id, nom, description) VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'UTILISATEUR', 'Utilisateur lambda - peut rechercher et voir les annonces'),
('b1ffcd99-9c1c-5ef9-cc7d-7cc0ce491b22', 'ACHETEUR', 'Acheteur - peut acheter, payer, laisser des avis'),
('c2ggde99-9c2d-6fg0-dd8e-8dd1df502c33', 'VENDEUR', 'Vendeur particulier - peut publier des véhicules'),
('d3hhef99-9c3e-7gh1-ee9f-9ee2eg613d44', 'CONCESSIONNAIRE', 'Concessionnaire - accès dashboard professionnel'),
('e4iiff99-9c4f-8hi2-ff0g-afe3fh724e55', 'LOCATAIRE', 'Locataire - peut réserver des véhicules'),
('f5jjgg99-9c5g-9ij3-gg1h-bgf4gi835f66', 'PROPRIETAIRE_LOUEUR', 'Propriétaire de véhicule de location'),
('g6kkhh99-9c6h-10jk4-hh2i-chg5hj946g77', 'COMPAGNIE_ASSURANCE', 'Compagnie d''assurance partenaire'),
('h7llii99-9c7i-11kl5-ii3j-dih6ik057h88', 'INSPECTEUR', 'Inspecteur pour certification véhicules'),
('i8mmjj99-9c8j-12lm6-jj4k-eji7jl168i99', 'GARAGE', 'Garage partenaire'),
('j9nnkk99-9c9k-13mn7-kk5l-fkj8km279j10', 'PARTENAIRE_FINANCIER', 'Banque/Microfinance partenaire'),
('k10oll99-9c10l-14no8-ll6m-glk9ln3810k21', 'ADMIN', 'Administrateur de la plateforme'),
('l11pmm99-9c11m-15op9-mm7n-hml0mo4911l32', 'MODERATEUR', 'Modérateur - traite les signalements'),
('m12qnn99-9c12n-16pq0-nn8o-inm1np5102m43', 'SUPER_ADMIN', 'Super Admin - accès complet système')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STATUTS VÉHICULES
-- ============================================

INSERT INTO statut_vehicule (id, nom, description) VALUES 
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'BROUILLON', 'Véhicule en cours de création'),
('d1ffcd99-9c1c-5ef9-cc7d-7cc0ce491b22', 'PUBLIE', 'Véhicule publié et visible'),
('e2ggde99-9c2d-6fg0-dd8e-8dd1df502c33', 'VENDU', 'Véhicule vendu'),
('f3hhef99-9c3e-7gh1-ee9f-9ee2eg613d44', 'RESERVE', 'Véhicule réservé'),
('g4iiff99-9c4f-8hi2-ff0g-afe3fh724e55', 'SUPPRIME', 'Véhicule supprimé');

-- ============================================
-- TYPES CARBURANTS
-- ============================================

INSERT INTO carburant (id, nom, description) VALUES 
('e5jggh99-9c5g-9ij3-gg1h-bgf4gi835e66', 'ESSENCE', 'Véhicule à essence'),
('f6khhi99-9c6h-10jk4-hh2i-chg6hj946f77', 'DIESEL', 'Véhicule diesel'),
('g7liij99-9c7i-11kl5-ii3j-dih7ik057g88', 'ELECTRIQUE', 'Véhicule électrique'),
('h8mjjk99-9c8j-12lm6-jj4k-eji8jl168h99', 'HYBRIDE', 'Véhicule hybride'),
('i9nkkl99-9c9k-13mn7-kk5l-fkj9km279i10', 'GPL', 'Véhicule GPL'),
('j10oll99-9c10l-14no8-ll6m-glk0ln3810j21', 'AUTRE', 'Autre type de carburant');

-- ============================================
-- TYPES BOITE DE VITESSES
-- ============================================

INSERT INTO boite_vitesse (id, nom, type) VALUES 
('k11pmm99-9c11m-15op9-mm7n-hml1mo4911k32', 'MANUELLE', 'Manuelle'),
('l12qnn99-9c12n-16pq0-nn8o-inm2np5102l43', 'AUTOMATIQUE', 'Automatique'),
('m13ronn99-9c13o-17qr1-oo9p-jon3oq6213m54', 'SEMI_AUTO', 'Semi-automatique');

-- ============================================
-- MARQUES VÉHICULES (Sénégal)
-- ============================================

INSERT INTO marque (id, nom, logo_url, pays_origine) VALUES 
('n14sppp99-9c14p-18rs2-pp10q-kpo4pr7324n65', 'TOYOTA', NULL, 'Japon'),
('o15tqqq99-9c15q-19st3-qq11r-lqp5qs8435o76', 'HONDA', NULL, 'Japon'),
('p16urrr99-9c16r-20tu4-rr12s-mrq6rt9546p87', 'HYUNDAI', NULL, 'Corée du Sud'),
('q17vsss99-9c17s-21uv5-ss13t-nsr7su0657q98', 'KIA', NULL, 'Corée du Sud'),
('r18wttt99-9c18t-22vw6-tt14u-ots8tv1768r09', 'PEUGEOT', NULL, 'France'),
('s19xuuu99-9c19u-23wx7-uu15v-put9uw2879s10', 'RENAULT', NULL, 'France'),
('t20yvww99-9c20v-24xy8-vv16w-qvu0vx390t21', 'MERCEDES', NULL, 'Allemagne'),
('u21zwxx99-9c21w-25yz9-ww17x-rwv1wy401u32', 'BMW', NULL, 'Allemagne'),
('v22axxy99-9c22x-26za0-xx18y-sxw2xz512v43', 'VOLKSWAGEN', NULL, 'Allemagne'),
('w23byyz99-9c23y-27ab1-yy19z-tyy3ya623w54', 'FORD', NULL, 'USA'),
('x24czzz99-9c24z-28bc2-zz20a-uzz4zb734x65', 'NISSAN', NULL, 'Japon'),
('y25daaa99-9c25a-29cd3-aa21b-vaa5ac845y76', 'MAZDA', NULL, 'Japon'),
('z26ebbb99-9c26b-30de4-bb22c-wbb6bd956z87', 'SUZUKI', NULL, 'Japon');

-- ============================================
-- MODÈLES VÉHICULES
-- ============================================

-- Toyota
INSERT INTO modele (id, marque_id, nom, annee_min, annee_max, categorie) VALUES 
('a27fcc99-9c27c-31ef5-cc23d-xcc7ce067a98', 'n14sppp99-9c14p-18rs2-pp10q-kpo4pr7324n65', 'Toyota Corolla', 2015, 2024, 'Berline'),
('b28gdd99-9c28d-32fg6-dd24e-ydd8df178b09', 'n14sppp99-9c14p-18rs2-pp10q-kpo4pr7324n65', 'Toyota Camry', 2015, 2024, 'Berline'),
('c29hee99-9c29e-33gh7-ee25f-zee9eg289c10', 'n14sppp99-9c14p-18rs2-pp10q-kpo4pr7324n65', 'Toyota RAV4', 2015, 2024, 'SUV'),
('d30iff99-9c30f-34hi8-ff26g-aff0fh390d21', 'n14sppp99-9c14p-18rs2-pp10q-kpo4pr7324n65', 'Toyota Prado', 2010, 2024, '4x4');

-- Honda
INSERT INTO modele (id, marque_id, nom, annee_min, annee_max, categorie) VALUES 
('e31jgg99-9c31g-35ij9-gg27h-bgg1gi401e32', 'o15tqqq99-9c15q-19st3-qq11r-lqp5qs8435o76', 'Honda Civic', 2015, 2024, 'Berline'),
('f32khh99-9c32h-36jk0-hh28i-chh2hj512f43', 'o15tqqq99-9c15q-19st3-qq11r-lqp5qs8435o76', 'Honda CR-V', 2015, 2024, 'SUV');

-- Hyundai
INSERT INTO modele (id, marque_id, nom, annee_min, annee_max, categorie) VALUES 
('g33lii99-9c33i-37kl1-ii29j-dii3ik623g54', 'p16urrr99-9c16r-20tu4-rr12s-mrq6rt9546p87', 'Hyundai Tucson', 2015, 2024, 'SUV'),
('h34mjj99-9c34j-38lm2-jj30k-ejj4jl734h65', 'p16urrr99-9c16r-20tu4-rr12s-mrq6rt9546p87', 'Hyundai Santa Fe', 2015, 2024, 'SUV');

-- Peugeot
INSERT INTO modele (id, marque_id, nom, annee_min, annee_max, categorie) VALUES 
('i35nkk99-9c35k-39mn3-kk31l-fkk5km845i76', 'r18wttt99-9c18t-22vw6-tt14u-ots8tv1768r09', 'Peugeot 208', 2015, 2024, 'Citadine'),
('j36oll99-9c36l-40no4-ll32m-gll6ln956j87', 'r18wttt99-9c18t-22vw6-tt14u-ots8tv1768r09', 'Peugeot 3008', 2015, 2024, 'SUV');

-- Renault
INSERT INTO modele (id, marque_id, nom, annee_min, annee_max, categorie) VALUES 
('k37pmm99-9c37m-41op5-mm33n-hmm7mo067k98', 's19xuuu99-9c19u-23wx7-uu15v-put9uw2879s10', 'Renault Clio', 2015, 2024, 'Citadine'),
('l38qnn99-9c38n-42pq6-nn34o-inn8np178l09', 's19xuuu99-9c19u-23wx7-uu15v-put9uw2879s10', 'Renault Duster', 2015, 2024, 'SUV');

-- ============================================
-- TYPES D'ASSURANCE
-- ============================================

-- Note: Les produits d'assurance seront créés par les compagnies d'assurance

-- ============================================
-- SERVICES GARAGE
-- ============================================

INSERT INTO service_garage (id, nom, description, categorie) VALUES 
('m39ropp99-9c39o-43qr7-oo35p-joo9pq289m10', 'Vidange', 'Vidange moteur et remplacement filtre', 'Entretien'),
('n40spqq99-9c40p-44rs8-pp36q-kpp0qr390n21', 'Pneumatiques', 'Changement et équilibrage pneus', 'Pneumatique'),
('o41tqrr99-9c41q-45st9-qq37r-lqq1rs401o32', 'Freinage', 'Contrôle et remplacement freins', 'Sécurité'),
('p42urrs99-9c42r-46tu0-rr38s-mrr2st512p43', 'Réparation carrosserie', 'Réparation dommages carrosserie', 'Carrosserie'),
('q43vsst99-9c43s-47uv1-ss39t-nss3tu623q54', 'Climatisation', 'Réparation et recharge clim', 'Climatisation'),
('r44wttu99-9c44t-48vw2-tt40u-ott4uv734r65', 'Diagnostic', 'Diagnostic électronique', 'Diagnostic'),
('s45xuuv99-9c45u-49wx3-uu41v-puu5vw845s76', 'Batterie', 'Contrôle et remplacement batterie', 'Électricité'),
('t46yvwv99-9c46v-50xy4-vv42w-qvv6wx956t87', 'Révision', 'Révision complète véhicule', 'Entretien');

-- ============================================
-- STATUTS RÉSERVATION
-- ============================================

-- Note: Les statuts de réservation sont gérés par l'enum StatutReservation

-- ============================================
-- ABONNEMENTS (PLANS)
-- ============================================

INSERT INTO abonnement (id, nom, description, type, duree_jours, prix, nombre_vehicules_max, nombre_photos_max, is_boost_inclus, is_actif) VALUES 
('u47zwxw99-9c47w-51yz5-ww43x-rww7xy067u98', 'BASIC', 'Plan basique pour particulier', 'PARTICULIER', 30, 5000.00, 3, 5, FALSE, TRUE),
('v48axxy99-9c48x-52za6-xx44y-sxx8yz178v09', 'PREMIUM', 'Plan premium pour particulier', 'PARTICULIER', 30, 15000.00, 10, 15, TRUE, TRUE),
('w49byyz99-9c49y-53ab7-yy45z-tyy9za289w10', 'PRO', 'Plan professionnel pour concessionnaire', 'PROFESSIONNEL', 30, 50000.00, 100, 30, TRUE, TRUE),
('x50czzz99-9c50z-54bc8-zz46a-uzz0ab390x21', 'ANNUEL_BASIC', 'Plan annuel basic', 'PARTICULIER', 365, 50000.00, 3, 5, FALSE, TRUE),
('y51daaa99-9c51a-55cd9-aa47b-vaa1bc401y32', 'ANNUEL_PREMIUM', 'Plan annuel premium', 'PARTICULIER', 365, 150000.00, 10, 15, TRUE, TRUE),
('z52ebbb99-9c52b-56de0-bb48c-wbb2cd512z43', 'ANNUEL_PRO', 'Plan annuel professionnel', 'PROFESSIONNEL', 365, 500000.00, 100, 30, TRUE, TRUE);

-- ============================================
-- MOTIFS DE SIGNALEMENT
-- ============================================

-- Note: Les motifs de signalement sont définis dans l'enum MotifSignalement

-- ============================================
-- TYPES DE NOTIFICATIONS
-- ============================================

-- Note: Les types de notifications sont définis dans l'enum TypeNotification
