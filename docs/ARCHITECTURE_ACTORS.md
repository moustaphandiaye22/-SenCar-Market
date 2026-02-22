# Documentation des Acteurs - Sen-Car Market

## Vue d'Ensemble

Ce document présente le mapping complet entre les acteurs métier de la plateforme Sen-Car Market et les modules backend existants.

---

## 1️⃣ Acteurs Principaux (Core Users)

### 1. 👤 Visiteur (Non authentifié)

| Attribut | Détail |
|----------|--------|
| **Rôle Backend** | Accès public (sans authentification) |
| **Modules** | [`vehicule`](Backend/src/main/java/com/sencarmarket/module/vehicule) (lecture seule) |
| **Permissions** | Parcourir annonces, Recherche véhicule, Voir détails, Voir avis, Inscription |

**Implémentation**: Routes publiques dans [`VehiculeController`](Backend/src/main/java/com/sencarmarket/module/vehicule/controller/VehiculeController.java) et [`AuthController`](Backend/src/main/java/com/sencarmarket/module/utilisateur/controller/AuthController.java)

---

### 2. 👨‍💼 Acheteur (Utilisateur particulier)

| Attribut | Détail |
|----------|--------|
| **Rôle Backend** | `ACHETEUR` |
| **TypeUtilisateur** | [`TypeUtilisateurRepository`](Backend/src/main/java/com/sencarmarket/module/utilisateur/repository/TypeUtilisateurRepository.java) |
| **Modules** | [`vehicule`](Backend/src/main/java/com/sencarmarket/module/vehicule), [`paiement`](Backend/src/main/java/com/sencarmarket/module/paiement), [`avis`](Backend/src/main/java/com/sencarmarket/module/avis), [`assurance`](Backend/src/main/java/com/sencarmarket/module/assurance), [`certification`](Backend/src/main/java/com/sencarmarket/module/certification) |
| **Permissions** | Rechercher véhicule, Ajouter en favori, Contacter vendeur, Acheter véhicule, Payer via escrow, Laisser un avis, Souscrire assurance, Faire demande certification |

**Implémentation**: [`CustomUserDetailsService`](Backend/src/main/java/com/sencarmarket/module/utilisateur/service/auth/CustomUserDetailsService.java) - `ROLE_USER`

---

### 3. 🚗 Vendeur Particulier

| Attribut | Détail |
|----------|--------|
| **Rôle Backend** | `VENDEUR` |
| **Modules** | [`vehicule`](Backend/src/main/java/com/sencarmarket/module/vehicule), [`abonnement`](Backend/src/main/java/com/sencarmarket/module/abonnement) (boost), [`messagerie`](Backend/src/main/java/com/sencarmarket/module/messagerie), [`paiement`](Backend/src/main/java/com/sencarmarket/module/paiement) |
| **Permissions** | Publier véhicule, Modifier annonce, Booster annonce, Accepter/refuser offre, Recevoir paiement, Répondre messages, Voir statistiques |

**Implémentation**: [`VehiculeController`](Backend/src/main/java/com/sencarmarket/module/vehicule/controller/VehiculeController.java) - Endpoints POST/PUT

---

### 4. 🏢 Concessionnaire (Vendeur Pro)

| Attribut | Détail |
|----------|--------|
| **Rôle Backend** | `VENDEUR` + Abonnement PRO |
| **Modules** | [`vehicule`](Backend/src/main/java/com/sencarmarket/module/vehicule) (bulk), [`abonnement`](Backend/src/main/java/com/sencarmarket/module/abonnement), [`admin`](Backend/src/main/java/com/sencarmarket/module/admin) (analytics), [`garage`](Backend/src/main/java/com/sencarmarket/module/garage) |
| **Permissions** | Publier plusieurs véhicules, Gérer inventaire, Voir analytics, Souscrire abonnement pro, Recevoir leads |
| **Différence** | Accès dashboard professionnel via [`TypeAbonnement.PRO`](Backend/src/main/java/com/sencarmarket/module/abonnement/enums/TypeAbonnement.java) |

**Implémentation**: [`AbonnementServiceImpl`](Backend/src/main/java/com/sencarmarket/module/abonnement/service/AbonnementServiceImpl.java)

---

### 5. 🔁 Locataire (Location)

| Attribut | Détail |
|----------|--------|
| **Rôle Backend** | `ACHETEUR` avec module location |
| **Modules** | [`annonce`](Backend/src/main/java/com/sencarmarket/module/annonce) (location), [`paiement`](Backend/src/main/java/com/sencarmarket/module/paiement) |
| **Permissions** | Réserver véhicule, Payer caution, Annuler réservation, Laisser avis |

**Implémentation**: [`LocationController`](Backend/src/main/java/com/sencarmarket/module/annonce/controller/LocationController.java)

---

### 6. 🚘 Propriétaire Loueur

| Attribut | Détail |
|----------|--------|
| **Rôle Backend** | `VENDEUR` avec module location |
| **Modules** | [`annonce`](Backend/src/main/java/com/sencarmarket/module/annonce) (location), [`paiement`](Backend/src/main/java/com/sencarmarket/module/paiement) |
| **Permissions** | Publier annonce location, Définir disponibilité, Accepter réservation, Recevoir paiement |

**Implémentation**: [`AnnonceLocationRepository`](Backend/src/main/java/com/sencarmarket/module/annonce/repository/AnnonceLocationRepository.java)

---

## 2️⃣ Acteurs Écosystème

### 7. 🛡 Compagnie d'Assurance

| Attribut | Détail |
|----------|--------|
| **Type** | Acteur externe / Module backend |
| **Modules** | [`assurance`](Backend/src/main/java/com/sencarmarket/module/assurance) |
| **Entités** | [`ProduitAssurance`](Backend/src/main/java/com/sencarmarket/module/assurance/entity/ProduitAssurance.java), [`OptionAssurance`](Backend/src/main/java/com/sencarmarket/module/assurance/entity/OptionAssurance.java), [`SouscriptionAssurance`](Backend/src/main/java/com/sencarmarket/module/assurance/entity/SouscriptionAssurance.java) |
| **Permissions** | Fournir produits assurance, Valider souscriptions, Générer contrat, Mettre à jour statut |

**Implémentation**: [`AssuranceController`](Backend/src/main/java/com/sencarmarket/module/assurance/controller/AssuranceController.java)

---

### 8. 🔍 Inspecteur / Agent Certification

| Attribut | Détail |
|----------|--------|
| **Type** | Backend Role / Module |
| **Modules** | [`certification`](Backend/src/main/java/com/sencarmarket/module/certification) |
| **Entités** | [`DemandeCertification`](Backend/src/main/java/com/sencarmarket/module/certification/entity/DemandeCertification.java), [`Inspection`](Backend/src/main/java/com/sencarmarket/module/certification/entity/Inspection.java), [`RapportInspection`](Backend/src/main/java/com/sencarmarket/module/certification/entity/RapportInspection.java) |
| **Permissions** | Recevoir demande inspection, Inspecter véhicule, Rédiger rapport, Valider certification |

**Implémentation**: [`CertificationController`](Backend/src/main/java/com/sencarmarket/module/certification/controller/CertificationController.java)

---

### 9. 🛠 Garage

| Attribut | Détail |
|----------|--------|
| **Type** | Entité + Module |
| **Modules** | [`garage`](Backend/src/main/java/com/sencarmarket/module/garage) |
| **Entités** | [`Garage`](Backend/src/main/java/com/sencarmarket/module/garage/entity/Garage.java), [`ServiceGarage`](Backend/src/main/java/com/sencarmarket/module/garage/entity/ServiceGarage.java), [`GarageServiceAssociation`](Backend/src/main/java/com/sencarmarket/module/garage/entity/GarageServiceAssociation.java) |
| **Permissions** | Créer profil, Publier services, Recevoir demandes, Être noté |

**Implémentation**: [`GarageController`](Backend/src/main/java/com/sencarmarket/module/garage/controller/GarageController.java)

---

### 10. 💼 Partenaire Financier

| Attribut | Détail |
|----------|--------|
| **Type** | Module / Intégration externe |
| **Modules** | [`tradein`](Backend/src/main/java/com/sencarmarket/module/tradein), [`paiement`](Backend/src/main/java/com/sencarmarket/module/paiement) |
| **Entités** | [`DemandeTradeIn`](Backend/src/main/java/com/sencarmarket/module/tradein/entity/DemandeTradeIn.java), [`HistoriqueEstimation`](Backend/src/main/java/com/sencarmarket/module/tradein/entity/HistoriqueEstimation.java) |
| **Permissions** | Financer achat véhicule, Valider crédit auto |

**Implémentation**: [`TradeInController`](Backend/src/main/java/com/sencarmarket/module/tradein/controller/TradeInController.java)

---

## 3️⃣ Acteurs Systèmes Externes

### 11. 💰 Système Paiement

| Attribut | Détail |
|----------|--------|
| **Type** | Module Backend |
| **Modules** | [`paiement`](Backend/src/main/java/com/sencarmarket/module/paiement) |
| **Entités** | [`Paiement`](Backend/src/main/java/com/sencarmarket/module/paiement/entity/Paiement.java), [`Portefeuille`](Backend/src/main/java/com/sencarmarket/module/paiement/entity/Portefeuille.java), [`TransactionPortefeuille`](Backend/src/main/java/com/sencarmarket/module/paiement/entity/TransactionPortefeuille.java) |
| **Intégrations** | Wave, Orange Money (via webhooks) |
| **Permissions** | Traiter paiement, Envoyer webhook, Confirmer transaction |

**Implémentation**: [`PaiementController`](Backend/src/main/java/com/sencarmarket/module/paiement/controller/PaiementController.java)

---

### 12. 🔔 Service Notification

| Attribut | Détail |
|----------|--------|
| **Type** | Module Backend + Service externe |
| **Modules** | [`notification`](Backend/src/main/java/com/sencarmarket/module/notification) |
| **Entités** | [`Notification`](Backend/src/main/java/com/sencarmarket/module/notification/entity/Notification.java) |
| **Intégrations** | Firebase, SMS Gateway |
| **Permissions** | Envoyer notifications push, Envoyer SMS OTP |

**Implémentation**: [`NotificationController`](Backend/src/main/java/com/sencarmarket/module/notification/controller/NotificationController.java)

---

## 4️⃣ Acteurs Internes

### 13. 🧑‍💼 Administrateur

| Attribut | Détail |
|----------|--------|
| **Rôle Backend** | `ADMIN` |
| **Modules** | [`admin`](Backend/src/main/java/com/sencarmarket/module/admin), [`notification`](Backend/src/main/java/com/sencarmarket/module/notification) |
| **Permissions** | Gérer utilisateurs, Suspendre comptes, Valider annonces, Gérer signalements, Voir statistiques, Gérer commissions |

**Implémentation**: [`AdminController`](Backend/src/main/java/com/sencarmarket/module/admin/controller/AdminController.java)

---

### 14. 🛡 Modérateur

| Attribut | Détail |
|----------|--------|
| **Rôle Backend** | `MODERATEUR` |
| **Modules** | [`notification`](Backend/src/main/java/com/sencarmarket/module/notification) (signalements) |
| **Permissions** | Traiter signalements, Supprimer contenu frauduleux, Vérifier annonces |

**Implémentation**: [`SignalementController`](Backend/src/main/java/com/sencarmarket/module/notification/controller/SignalementController.java)

---

### 15. 📊 Super Admin

| Attribut | Détail |
|----------|--------|
| **Rôle Backend** | `ADMIN` (privilèges élevés) |
| **Modules** | [`admin`](Backend/src/main/java/com/sencarmarket/module/admin), [`abonnement`](Backend/src/main/java/com/sencarmarket/module/abonnement) |
| **Permissions** | Gérer rôles, Gérer abonnements, Configurer commissions, Accès complet système |

**Implémentation**: [`AdminController`](Backend/src/main/java/com/sencarmarket/module/admin/controller/AdminController.java) - Méthodes de gestion des rôles

---

## 5️⃣ Acteurs Automatisés (Système interne)

### 16. 🤖 Moteur d'Estimation

| Attribut | Détail |
|----------|--------|
| **Type** | Service / Algorithm |
| **Statut** | 🔴 **Non implémenté** |
| **Fonctionnalité** | Calcul prix recommandé, Analyse marché |

**TODO**: Créer [`EstimationService`](Backend/src/main/java/com/sencarmarket/module/estimation) avec algorithme ML

---

### 17. 📈 Moteur de Recommandation

| Attribut | Détail |
|----------|--------|
| **Type** | Service / Algorithm |
| **Statut** | 🔴 **Non implémenté** |
| **Fonctionnalité** | Suggestions personnalisées, Boost intelligent |

**TODO**: Créer [`RecommendationService`](Backend/src/main/java/com/sencarmarket/module/recommandation) basé sur [`VehiculeFavori`](Backend/src/main/java/com/sencarmarket/module/vehicule/entity/VehiculeFavori.java)

---

### 18. ⏱ Système Escrow Automatique

| Attribut | Détail |
|----------|--------|
| **Type** | Module Backend |
| **Modules** | [`paiement`](Backend/src/main/java/com/sencarmarket/module/paiement) |
| **Implémentation** | [`PaiementService`](Backend/src/main/java/com/sencarmarket/module/paiement/service/PaiementService.java) |
| **Fonctionnalité** | Bloque paiement, Libère paiement, Applique commission |

---

## 📊 Matrice de Compatibilité

| Module | Visiteur | Acheteur | Vendeur | Concessionnaire | Locataire | Proprio Loueur | Admin | Modérateur |
|--------|----------|----------|---------|------------------|------------|----------------|-------|------------|
| **vehicule** | R | R/W | R/W | R/W (bulk) | R | R | R/W | R |
| **paiement** | ❌ | W | W | W | W | W | R | ❌ |
| **avis** | R | R/W | R/W | R/W | R/W | R/W | R | R/W |
| **assurance** | R | R/W | R | R | R | R | R | ❌ |
| **certification** | ❌ | R/W | R/W | R/W | ❌ | ❌ | R | ❌ |
| **abonnement** | ❌ | ❌ | R/W | R/W | ❌ | R/W | R/W | ❌ |
| **garage** | R | R | R | R/W | R | R | R/W | R |
| **tradein** | ❌ | R/W | R/W | R/W | ❌ | ❌ | R | ❌ |
| **annonce (location)** | R | R/W | ❌ | ❌ | R/W | R/W | R | R |
| **messagerie** | ❌ | R/W | R/W | R/W | R/W | R/W | R | ❌ |
| **notification** | ❌ | R | R | R | R | R | R/W | R/W |
| **admin** | ❌ | ❌ | ❌ | R | ❌ | ❌ | R/W | R |

**Légende**: R = Lecture, W = Écriture, ❌ = Non autorisé

---

## 🔴 Gaps Identifiés

### Gaps Prioritaires

1. **Moteur d'Estimation** (Acteur 16)
   - Non implémenté
   - Besoin: Service d'estimation de prix basé sur les données du marché

2. **Moteur de Recommandation** (Acteur 17)
   - Non implémenté
   - Besoin: Suggestions personnalisées basées sur l'historique de recherche

### Gaps Secondaires

3. **TypeUtilisateur incomplet**
   - Types actuels: `UTILISATEUR`, `VENDEUR`, `ACHETEUR`, `ADMIN`, `MODERATEUR`
   - Manquant: `INSPECTEUR`, `CONCESSIONNAIRE`, `GARAGE`, `COMPAGNIE_ASSURANCE`, `PARTENAIRE_FINANCIER`

4. **Partenaire Financier**
   - Module `tradein` existant mais pas d'intégration directe avec les banques/microfinances

---

## ⚠️ Analyse de Sécurité - Guards & Middleware

### ✅ Ce qui Est Implémenté

| Élément | Fichier | Détail |
|---------|---------|--------|
| JWT Auth | [`JwtAuthenticationFilter.java`](Backend/src/main/java/com/sencarmarket/config/JwtAuthenticationFilter.java) | Filter d'authentification JWT |
| Password Encoding | [`SecurityConfig.java`](Backend/src/main/java/com/sencarmarket/config/SecurityConfig.java) | BCrypt |
| Stateless | [`SecurityConfig.java`](Backend/src/main/java/com/sencarmarket/config/SecurityConfig.java) | Session STATELESS |
| Admin Guard | [`AdminController.java:29`](Backend/src/main/java/com/sencarmarket/module/admin/controller/AdminController.java:29) | `@PreAuthorize("hasRole('ADMIN')")` |

### 🔴 Problèmes Critiques - Contrôle d'Accès

| Controller | Méthode | Problème Détecté | Sévérité |
|------------|---------|------------------|----------|
| [`VehiculeController`](Backend/src/main/java/com/sencarmarket/module/vehicule/controller/VehiculeController.java) | `deleteVehicule()` L55 | ⚠️ Pas de vérification propriété - Tout user peut supprimer n'importe quel véhicule | 🔴 CRITIQUE |
| [`VehiculeController`](Backend/src/main/java/com/sencarmarket/module/vehicule/controller/VehiculeController.java) | `boostVehicule()` L79 | ⚠️ Pas de vérification propriété | 🔴 CRITIQUE |
| [`VehiculeController`](Backend/src/main/java/com/sencarmarket/module/vehicule/controller/VehiculeController.java) | `publishVehicule()` L49 | ⚠️ Pas de vérification propriété | 🔴 CRITIQUE |

### 🔴 Annotations @PreAuthorize Manquantes

**Actuel**: Seul [`AdminController`](Backend/src/main/java/com/sencarmarket/module/admin/controller/AdminController.java) utilise `@PreAuthorize`

**À ajouter**:
- `ACHETEUR` → [`AvisController`](Backend/src/main/java/com/sencarmarket/module/avis/controller/AvisController.java)
- `VENDEUR` → [`VehiculeController`](Backend/src/main/java/com/sencarmarket/module/vehicule/controller/VehiculeController.java), [`AbonnementController`](Backend/src/main/java/com/sencarmarket/module/abonnement/controller/AbonnementController.java)
- `MODERATEUR` → [`SignalementController`](Backend/src/main/java/com/sencarmarket/module/notification/controller/SignalementController.java)

### 🔴 TypeUtilisateur Non Vérifié dans les Services

**Problème dans** [`VehiculeService.java:43-47`](Backend/src/main/java/com/sencarmarket/module/vehicule/service/VehiculeService.java:43):

```java
// ❌ Aucune vérification du typeUtilisateur
public VehiculeResponse createVehicule(CreateVehiculeRequest request, String userEmail) {
    // N'importe quel utilisateur peut créer un véhicule
}
```

**Solution**:
```java
// ✅ À ajouter
Utilisateur utilisateur = utilisateurRepository.findByEmail(userEmail).orElseThrow(...);
if (!utilisateur.getTypeUtilisateur().getNom().equals("VENDEUR") && 
    !utilisateur.getTypeUtilisateur().getNom().equals("CONCESSIONNAIRE")) {
    throw new UnauthorizedAccessException("Seuls les vendeurs peuvent publier");
}
```

### 📋 Résumé: 18 Acteurs - État d'Implémentation

| # | Acteur | Modules | Guards | Status |
|---|--------|---------|--------|--------|
| 1 | Visiteur | vehicule (R) | ✅ | OK |
| 2 | Acheteur | vehicule, paiement, avis... | ⚠️ Partiel | À corriger |
| 3 | Vendeur Particulier | vehicule, abonnement... | ⚠️ Partiel | À corriger |
| 4 | Concessionnaire | vehicule (bulk), abonnement | ⚠️ Partiel | À corriger |
| 5 | Locataire | annonce, paiement | ⚠️ Partiel | À corriger |
| 6 | Proprio Loueur | annonce, paiement | ⚠️ Partiel | À corriger |
| 7 | Compagnie Assurance | assurance | ⚠️ Partiel | À corriger |
| 8 | Inspecteur | certification | ⚠️ Partiel | À corriger |
| 9 | Garage | garage | ⚠️ Partiel | À corriger |
| 10 | Partenaire Financier | tradein | ⚠️ Partiel | À corriger |
| 11 | Système Paiement | paiement | ✅ | OK |
| 12 | Service Notification | notification | ✅ | OK |
| 13 | Administrateur | admin | ✅ `@PreAuthorize` | OK |
| 14 | Modérateur | notification | ⚠️ Partiel | À corriger |
| 15 | Super Admin | admin | ⚠️ Partiel | À corriger |
| 16 | Moteur Estimation | - | ❌ | Non implémenté |
| 17 | Moteur Recommandation | - | ❌ | Non implémenté |
| 18 | Système Escrow | paiement | ✅ | OK |

---

## 📁 Structure des Modules

```
Backend/src/main/java/com/sencarmarket/module/
├── utilisateur/          # Gestion des utilisateurs (1, 2, 3, 4)
├── vehicule/             # Gestion des véhicules (1, 2, 3, 4)
├── paiement/             # Système de paiement (2, 3, 4, 11, 18)
├── notification/         # Notifications (12)
├── messagerie/           # Messagerie instantanée (2, 3, 4)
├── avis/                 # Système d'avis (1, 2)
├── assurance/            # Assurance véhicule (2, 7)
├── certification/        # Certification véhicules (2, 8)
├── abonnement/           # Abonnements (3, 4, 15)
├── garage/               # Garages partenaires (9)
├── admin/                # Administration (13, 14, 15)
├── tradein/              # Trade-in (10)
└── annonce/              # Annonces location (5, 6)
```

---

*Document généré pour Sen-Car Market - Architecture des Acteurs*
