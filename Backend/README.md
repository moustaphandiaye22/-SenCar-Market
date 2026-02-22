# Sen-Car Market - Backend

## 📋 Description

**Sen-Car Market** est une plateforme de vente et de location de véhicules au Sénégal. Ce backend Spring Boot fournit une API REST complète pour gérer:
- 🔐 Authentification et gestion des utilisateurs
- 🚗 Gestion des véhicules (vente et location)
- 💳 Système de paiement (Wave, Orange Money, Escrow)
- 🏢 Gestion des concessionnaires et garages
- 🛡️ Système d'assurance
- 📜 Certification des véhicules
- 💬 Messagerie en temps réel
- 📢 Notifications et signalements
- 📊 Abonnements et boost d'annonces

## 🛠️ Technologies

| Technologie | Version |
|-------------|---------|
| Spring Boot | 3.2.0 |
| Java | 17 |
| Maven | 3.9+ |
| MySQL | 8.0+ |
| Spring Security | 6.x |
| Spring Data JPA | 3.x |
| JWT | Pour l'authentification |

## 🏗️ Architecture du Projet

```
Backend/
├── src/main/java/com/sencarmarket/
│   ├── SenCarMarketApplication.java      # Point d'entrée
│   ├── config/                           # Configuration
│   │   ├── DataInitializer.java          # Données initiales
│   │   ├── SecurityConfig.java           # Sécurité Spring
│   │   └── JwtAuthenticationFilter.java  # Filtre JWT
│   ├── module/
│   │   ├── utilisateur/                  # Gestion utilisateurs
│   │   │   ├── entity/
│   │   │   │   ├── Utilisateur.java
│   │   │   │   ├── TypeUtilisateur.java
│   │   │   │   └── OtpCode.java
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java
│   │   │   │   └── UtilisateurController.java
│   │   │   ├── service/auth/
│   │   │   │   ├── AuthenticationService.java
│   │   │   │   ├── JwtService.java
│   │   │   │   └── CustomUserDetailsService.java
│   │   │   └── repository/
│   │   ├── vehicule/                     # Véhicules
│   │   │   ├── entity/
│   │   │   │   ├── Vehicule.java
│   │   │   │   ├── Marque.java
│   │   │   │   └── PhotoVehicule.java
│   │   │   ├── controller/
│   │   │   │   └── VehiculeController.java
│   │   │   └── service/
│   │   ├── paiement/                     # Paiements
│   │   │   ├── entity/
│   │   │   │   ├── Paiement.java
│   │   │   │   ├── Portefeuille.java
│   │   │   │   └── TransactionPortefeuille.java
│   │   │   ├── controller/
│   │   │   │   └── PaiementController.java
│   │   │   └── service/
│   │   ├── annonce/                      # Locations
│   │   ├── assurance/                    # Assurances
│   │   ├── certification/                # Certifications
│   │   ├── garage/                       # Garages
│   │   ├── tradein/                     # Trade-In
│   │   ├── abonnement/                  # Abonnements
│   │   ├── avis/                        # Avis/Notes
│   │   ├── messagerie/                   # Messagerie
│   │   ├── notification/                # Notifications
│   │   └── commun/                      # Commun
│   │       ├── service/
│   │       │   ├── AuthorizationService.java
│   │       │   └── AuditService.java
│   │       ├── entity/
│   │       │   └── AuditLog.java
│   │       └── exception/
│   └── controller/
└── pom.xml
```

## 👥 Acteurs du Système (18 Types)

### Utilisateurs Principaux
| Rôle | Description | Inscription |
|-------|-------------|-------------|
| UTILISATEUR | Utilisateur lambda | ✅ Auto |
| ACHETEUR | Acheteur de véhicules | ✅ Auto |
| VENDEUR | Vendeur particulier | ✅ Auto |
| CONCESSIONNAIRE | Vendeur professionnel | ✅ Auto |
| LOCATAIRE | Locataire de véhicules | ✅ Auto |
| PROPRIETAIRE_LOUEUR | Propriétaire de véhicules de location | ✅ Auto |

### Partenaires Écosystème
| Rôle | Description | Inscription |
|-------|-------------|-------------|
| COMPAGNIE_ASSURANCE | Compagnie d'assurance partenaire | ❌ Admin |
| INSPECTEUR | Inspecteur pour certification | ❌ Admin |
| GARAGE | Garage partenaire | ❌ Admin |
| PARTENAIRE_FINANCIER | Banque/Microfinance | ❌ Admin |

### Administration
| Rôle | Description | Inscription |
|-------|-------------|-------------|
| ADMIN | Administrateur | ❌ Super Admin |
| MODERATEUR | Modérateur | ❌ Super Admin |
| SUPER_ADMIN | Super Administrateur | ❌ Système |

### Systèmes (Non-utilisateurs)
- **Système Paiement**: Wave, Orange Money (webhooks)
- **Service Notification**: Firebase, SMS Gateway
- **Moteur d'Estimation**: Calcul de prix
- **Moteur de Recommandation**: Suggestions
- **Système Escrow**: Blocage/libération fonds

## 🔐 Sécurité

### Authentification JWT
- Tokens JWT avec expiration configurable
- Refresh tokens pour renouvellement
- Double authentification (OTP) optionnelle

### Autorisation
- Contrôle d'accès basé sur les rôles (RBAC)
- `@PreAuthorize` pour tous les endpoints protégés
- Vérification de propriété des ressources

### Journalisation d'Audit
- [`AuditLog`](module/commun/entity/AuditLog.java) - Entité d'audit
- [`AuditService`](module/commun/service/AuditService.java) - Service d'audit
- Actions journalisées:
  - Connexions (succès/échec)
  - Inscriptions
  - Changements de mot de passe
  - Opérations de paiement
  - Opérations administratives

## 📡 API Endpoints

### Authentification
| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/auth/register` | Inscription | ❌ |
| POST | `/api/auth/login` | Connexion | ❌ |
| POST | `/api/auth/refresh` | Rafraîchir token | ❌ |
| POST | `/api/auth/logout` | Déconnexion | ✅ |
| POST | `/api/auth/password/reset` | Réinitialiser mot de passe | ❌ |

### Utilisateurs
| Méthode | Endpoint | Description | Rôle |
|---------|----------|-------------|------|
| GET | `/api/utilisateurs/{id}` | Voir profil | Utilisateur |
| PUT | `/api/utilisateurs/profile` | Modifier profil | Utilisateur |
| PUT | `/api/utilisateurs/password` | Changer mot de passe | Utilisateur |
| GET | `/api/utilisateurs` | Liste utilisateurs | Admin |

### Véhicules
| Méthode | Endpoint | Description | Rôle |
|---------|----------|-------------|------|
| GET | `/api/vehicules` | Liste véhicules | Public |
| GET | `/api/vehicules/{id}` | Détails véhicule | Public |
| POST | `/api/vehicules` | Créer véhicule | Vendeur/Concessionnaire |
| PUT | `/api/vehicules/{id}` | Modifier véhicule | Propriétaire |
| DELETE | `/api/vehicules/{id}` | Supprimer véhicule | Propriétaire/Admin |
| PUT | `/api/vehicules/{id}/publish` | Publier | Vendeur/Concessionnaire |
| POST | `/api/vehicules/{id}/boost` | Booster | Vendeur/Concessionnaire |

### Paiements
| Méthode | Endpoint | Description | Rôle |
|---------|----------|-------------|------|
| POST | `/api/paiements` | Créer paiement | Utilisateur |
| POST | `/api/paiements/escrow` | Paiement escrow | Utilisateur |
| POST | `/api/paiements/wave` | Paiement Wave | Utilisateur |
| POST | `/api/paiements/orange-money` | Paiement Orange Money | Utilisateur |
| PUT | `/api/paiements/{id}/confirmer` | Confirmer | Utilisateur |
| GET | `/api/paiements/portefeuille/{id}` | Voir portefeuille | Propriétaire |
| POST | `/api/paiements/portefeuille/crediter` | Créditer | Utilisateur |
| POST | `/api/paiements/portefeuille/debiter` | Débiter | Utilisateur |

### Locations
| Méthode | Endpoint | Description | Rôle |
|---------|----------|-------------|------|
| POST | `/api/locations/annonces` | Créer annonce | Propriétaire Loueur |
| GET | `/api/locations/annonces` | Liste annonces | Public |
| POST | `/api/locations/reservations` | Réserver | Locataire |
| PUT | `/api/locations/reservations/{id}/confirmer` | Confirmer | Propriétaire |
| DELETE | `/api/locations/reservations/{id}` | Annuler | Locataire/Admin |

### Assurances
| Méthode | Endpoint | Description | Rôle |
|---------|----------|-------------|------|
| GET | `/api/assurances/produits` | Liste produits | Public |
| POST | `/api/assurances/produits` | Créer produit | Compagnie Assurance |
| POST | `/api/assurances/souscriptions` | Souscrire | Utilisateur |

### Certifications
| Méthode | Endpoint | Description | Rôle |
|---------|----------|-------------|------|
| POST | `/api/certifications/demandes` | Demander | Vendeur |
| POST | `/api/certifications/inspections` | Inspecter | Inspecteur |
| PUT | `/api/certifications/{id}/valider` | Valider | Admin |

### Garages
| Méthode | Endpoint | Description | Rôle |
|---------|----------|-------------|------|
| POST | `/api/garages` | Créer profil | Garage |
| GET | `/api/garages` | Liste garages | Public |
| GET | `/api/garages/{id}` | Détails garage | Public |

### Messagerie
| Méthode | Endpoint | Description | Rôle |
|---------|----------|-------------|------|
| POST | `/api/messagerie/conversations` | Nouvelle conversation | Utilisateur |
| GET | `/api/messagerie/conversations` | Liste conversations | Utilisateur |
| POST | `/api/messagerie/messages` | Envoyer message | Utilisateur |
| GET | `/api/messagerie/conversations/{id}/messages` | Messages conversation | Participant |

### Signalements
| Méthode | Endpoint | Description | Rôle |
|---------|----------|-------------|------|
| POST | `/api/signalements` | Signaler | Utilisateur |
| GET | `/api/signalements` | Liste signalements | Modérateur |
| PUT | `/api/signalements/{id}/traiter` | Traiter | Modérateur |

### Abonnements
| Méthode | Endpoint | Description | Rôle |
|---------|----------|-------------|------|
| GET | `/api/abonnements/plans` | Liste plans | Public |
| POST | `/api/abonnements/souscrire` | Souscrire | Vendeur |
| POST | `/api/abonnements/boost` | Booster annonce | Vendeur |

### Administration
| Méthode | Endpoint | Description | Rôle |
|---------|----------|-------------|------|
| GET | `/api/admin/dashboard` | Tableau de bord | Admin |
| PUT | `/api/admin/utilisateurs/{id}/role` | Changer rôle | Admin |
| DELETE | `/api/admin/utilisateurs/{id}` | Supprimer utilisateur | Admin |
| GET | `/api/admin/statistiques` | Statistiques | Admin |

## ⚙️ Configuration

### Base de données
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/sen_car_market
spring.datasource.username=root
spring.datasource.password=votre_mot_de_passe
```

### JWT
```properties
jwt.secret=votre_secret_jwt
jwt.expiration=86400000
```

### Paiements
```properties
paiements.commission.taux=0.05
paiements.wave.secret=votre_wave_secret
paiements.om.secret=votre_om_secret
```

## 🗄️ Base de données

### Migrations Flyway
Le projet utilise **Flyway** pour la gestion des migrations de base de données.

#### Fichiers de migration
```
src/main/resources/db/migration/
├── V1__Initial_schema.sql    # Schéma initial complet
├── V2__Seed_data.sql         # Données initiales (seeders)
```

#### Configuration
Les migrations sont activées par défaut:
```properties
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
spring.flyway.baseline-on-migrate=true
```

#### Commandes utiles
```bash
# Appliquer les migrations au démarrage
mvn spring-boot:run

# Créer une nouvelle migration
mvn flyway:migrate

# Nettoyer la base (⚠️ Danger)
mvn flyway:clean
```

### Structure des tables
- **26+ tables** pour gérer:
  - Utilisateurs et authentification
  - Véhicules et recherches
  - Paiements et portefeuille
  - Locations et réservations
  - Assurances
  - Garages et services
  - Certifications
  - Messagerie
  - Notifications
  - Signalements
  - Avis
  - Trade-In
  - Abonnements
  - Audit logs

## � Installation

```bash
# Cloner le projet
git clone <repository-url>

# Compiler
mvn clean install

# Lancer
mvn spring-boot:run
```

L'application sera accessible sur: `http://localhost:8080`

## 📝 Inscription avec Type Utilisateur

Pour s'inscrire, envoyez:
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "telephone": "+221771234567",
  "motDePasse": "password123",
  "prenom": "Prenom",
  "nom": "Nom",
  "typeUtilisateur": "ACHETEUR"
}
```

**Types autorisés:**
- `UTILISATEUR`, `ACHETEUR`, `VENDEUR`, `CONCESSIONNAIRE`, `LOCATAIRE`, `PROPRIETAIRE_LOUEUR`

**Types restreints (admin uniquement):**
- `ADMIN`, `MODERATEUR`, `SUPER_ADMIN`, `COMPAGNIE_ASSURANCE`, `INSPECTEUR`, `GARAGE`, `PARTENAIRE_FINANCIER`

## 🧪 Tests

```bash
# Lancer les tests
mvn test

# Tests avec couverture
mvn test -Dcoverage
```

## 📄 Licence

Ce projet est propriété de Sen-Car Market.
