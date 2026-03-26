# 🚗 Sen-Car Market - API Backend

> La plateforme de référence pour l'achat, la vente et la location de véhicules au Sénégal.

[![NestJS](https://img.shields.io/badge/NestJS-Framework-red)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-blue)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)](https://www.postgresql.org/)
[![Render](https://img.shields.io/badge/Render-Deployment-purple)](https://render.com/)

---

## 🌐 URLs de l'Application

| Environnement                   | URL                                        |
| ------------------------------- | ------------------------------------------ |
| **Backend (Production)**        | https://sencar-market.onrender.com         |
| **API Documentation (Swagger)** | https://sencar-market.onrender.com/swagger |
| **Frontend (À venir)**          | https://sencar-market.vercel.app           |

---

## 🏗️ Architecture du Projet

```
Sen-Car-Market/
├── Backend/                    # API NestJS
│   ├── src/
│   │   ├── modules/           # Modules métier
│   │   ├── common/           # Composants partagés
│   │   ├── config/          # Configuration
│   │   └── prisma/           # Modèle de données
│   ├── prisma/
│   │   └── schema.prisma    # Schéma base de données
│   ├── Dockerfile            # Container Docker
│   └── Jenkinsfile           # Pipeline CI/CD
│
├── Frontend/                   # Application Angular (À venir)
│   ├── src/
│   ├── nginx.conf            # Configuration Nginx
│   └── Dockerfile            # Container Docker
│
└── docker-compose.yml          # Développement local
```

---

## 🛠️ Stack Technique

| Categorie             | Technologie                          |
| --------------------- | ------------------------------------ |
| **Backend**           | NestJS (TypeScript)                  |
| **ORM**               | Prisma                               |
| **Base de données**   | PostgreSQL (Neon Serverless)         |
| **Authentification**  | JWT + OTP                            |
| **Documentation API** | Swagger/OpenAPI                      |
| **Containerisation**  | Docker                               |
| **CI/CD**             | Jenkins                              |
| **Hébergement**       | Render (Backend) + Vercel (Frontend) |

---

## 📚 Modules de l'API

### 1. Authentication 🔐

Gestion des utilisateurs - inscription, connexion, mot de passe

| Méthode | Endpoint                    | Description                |
| ------- | --------------------------- | -------------------------- |
| POST    | `/api/auth/register`        | Inscription utilisateur    |
| POST    | `/api/auth/verify-otp`      | Vérification OTP           |
| POST    | `/api/auth/resend-otp`      | Renvoi OTP                 |
| POST    | `/api/auth/login`           | Connexion                  |
| POST    | `/api/auth/refresh`         | Rafraîchir token           |
| GET     | `/api/auth/me`              | Profil utilisateur         |
| PUT     | `/api/auth/profile`         | Mettre à jour profil       |
| POST    | `/api/auth/change-password` | Changer mot de passe       |
| POST    | `/api/auth/forgot-password` | Mot de passe oublié        |
| POST    | `/api/auth/reset-password`  | Réinitialiser mot de passe |

---

### 2. Administration 👨‍💼

Tableau de bord et gestion admin

| Méthode | Endpoint                           | Description            |
| ------- | ---------------------------------- | ---------------------- |
| GET     | `/api/admin/dashboard/stats`       | Statistiques dashboard |
| GET     | `/api/admin/utilisateurs`          | Liste utilisateurs     |
| PUT     | `/api/admin/utilisateurs/:id/role` | Modifier rôle          |
| GET     | `/api/admin/annonces`              | Liste annonces         |
| GET     | `/api/admin/transactions`          | Liste transactions     |

---

### 3. Véhicules 🚗

Annonces de véhicules - vente et location

| Méthode | Endpoint                     | Description       |
| ------- | ---------------------------- | ----------------- |
| POST    | `/api/vehicules`             | Créer annonce     |
| GET     | `/api/vehicules`             | Liste véhicules   |
| GET     | `/api/vehicules/:id`         | Détails véhicule  |
| GET     | `/api/vehicules/moi`         | Mes véhicules     |
| PUT     | `/api/vehicules/:id/publish` | Publier annonce   |
| DELETE  | `/api/vehicules/:id`         | Supprimer annonce |
| POST    | `/api/vehicules/:id/favoris` | Ajouter favori    |
| DELETE  | `/api/vehicules/:id/favoris` | Retirer favori    |
| GET     | `/api/vehicules/favoris/moi` | Mes favoris       |
| POST    | `/api/vehicules/:id/boost`   | Booster annonce   |

---

### 4. Garages 🔧

Services garages et mécaniques

| Méthode | Endpoint                        | Description           |
| ------- | ------------------------------- | --------------------- |
| POST    | `/api/garages`                  | Créer garage          |
| GET     | `/api/garages`                  | Liste garages         |
| GET     | `/api/garages/actifs`           | Garages actifs        |
| GET     | `/api/garages/en-attente`       | En attente validation |
| GET     | `/api/garages/search/ville`     | Recherche par ville   |
| GET     | `/api/garages/search/proximity` | Recherche proximité   |
| GET     | `/api/garages/:id`              | Détails garage        |
| PUT     | `/api/garages/:id`              | Modifier garage       |
| POST    | `/api/garages/:id/validate`     | Valider garage        |

---

### 5. Assurances 📋

Produits et souscriptions d'assurance

| Méthode | Endpoint                            | Description          |
| ------- | ----------------------------------- | -------------------- |
| POST    | `/api/assurances/produits`          | Créer produit        |
| GET     | `/api/assurances/produits`          | Liste produits       |
| GET     | `/api/assurances/produits/actifs`   | Produits actifs      |
| POST    | `/api/assurances/souscriptions`     | Souscrire assurance  |
| GET     | `/api/assurances/souscriptions/:id` | Détails souscription |
| GET     | `/api/assurances/calcul-prix`       | Calculer prix        |

---

### 6. Locations 🚙

Gestion des locations de véhicules

| Méthode | Endpoint                      | Description            |
| ------- | ----------------------------- | ---------------------- |
| POST    | `/api/locations/annonces`     | Créer annonce location |
| PUT     | `/api/locations/annonces/:id` | Modifier annonce       |
| GET     | `/api/locations/annonces`     | Liste locations        |
| POST    | `/api/locations/reservations` | Réserver véhicule      |

---

### 7. Paiements 💳

Wave, Orange Money, Escrow

| Méthode | Endpoint                               | Description           |
| ------- | -------------------------------------- | --------------------- |
| POST    | `/api/paiements`                       | Créer paiement        |
| POST    | `/api/paiements/wave`                  | Paiement Wave         |
| POST    | `/api/paiements/orange-money`          | Paiement Orange Money |
| POST    | `/api/paiements/escrow`                | Paiement Escrow       |
| GET     | `/api/paiements/:id`                   | Détails paiement      |
| POST    | `/api/paiements/portefeuille/crediter` | Crediter portefeuille |
| POST    | `/api/paiements/portefeuille/debiter`  | Debiter portefeuille  |
| GET     | `/api/paiements/transactions/:id`      | Détails transaction   |

---

### 8. Abonnements ⭐

Plans premium et boosts

| Méthode | Endpoint                                  | Description      |
| ------- | ----------------------------------------- | ---------------- |
| POST    | `/api/abonnements/plans`                  | Créer plan       |
| GET     | `/api/abonnements/plans`                  | Liste plans      |
| POST    | `/api/abonnements/souscription`           | Souscrire plan   |
| GET     | `/api/abonnements/utilisateurs/:id/actif` | Abonnement actif |
| POST    | `/api/abonnements/boosts`                 | Créer boost      |
| POST    | `/api/abonnements/utilisateurs/:id/renew` | Renouveler       |

---

### 9. Notifications 🔔

Notifications push et email

| Méthode | Endpoint                                      | Description         |
| ------- | --------------------------------------------- | ------------------- |
| GET     | `/api/notifications/utilisateur/:id`          | Liste notifications |
| PUT     | `/api/notifications/:id/read`                 | Marquer lu          |
| PUT     | `/api/notifications/utilisateur/:id/read-all` | Tout marquer lu     |
| GET     | `/api/notifications/utilisateur/:id/unread`   | Non lus             |

---

### 10. Signalements 🚨

Signalements de contenu

| Méthode | Endpoint                        | Description             |
| ------- | ------------------------------- | ----------------------- |
| POST    | `/api/signalements`             | Signaler contenu        |
| GET     | `/api/signalements`             | Liste signalements      |
| GET     | `/api/signalements/pending`     | Signalements en attente |
| POST    | `/api/signalements/:id/traiter` | Traiter signalement     |

---

### 11. Messagerie 💬

Conversations et messages

| Méthode | Endpoint                                     | Description           |
| ------- | -------------------------------------------- | --------------------- |
| POST    | `/api/messagerie/conversations`              | Nouvelle conversation |
| GET     | `/api/messagerie/conversations`              | Liste conversations   |
| POST    | `/api/messagerie/messages`                   | Envoyer message       |
| GET     | `/api/messagerie/conversations/:id/messages` | Messages conversation |
| POST    | `/api/messagerie/conversations/:id/leave`    | Quitter conversation  |

---

### 12. Trade-In 🔄

Échange de véhicules

| Méthode | Endpoint                           | Description      |
| ------- | ---------------------------------- | ---------------- |
| POST    | `/api/tradein/demandes`            | Demande trade-in |
| GET     | `/api/tradein/demandes`            | Liste demandes   |
| GET     | `/api/tradein/demandes/:id`        | Détails demande  |
| POST    | `/api/tradein/estimation`          | Estimer véhicule |
| PATCH   | `/api/tradein/demandes/:id/statut` | Modifier statut  |

---

### 13. Avis et Notes ⭐

Avis et évaluations

| Méthode | Endpoint                    | Description      |
| ------- | --------------------------- | ---------------- |
| POST    | `/api/avis`                 | Donner avis      |
| GET     | `/api/avis/:id`             | Détails avis     |
| GET     | `/api/avis/utilisateur/:id` | Avis utilisateur |
| GET     | `/api/avis/vehicule/:id`    | Avis véhicule    |
| GET     | `/api/avis/garage/:id`      | Avis garage      |
| POST    | `/api/avis/:id/signaler`    | Signaler avis    |
| DELETE  | `/api/avis/:id`             | Supprimer avis   |

---

### 14. Certifications ✅

Certifications véhicules

| Méthode | Endpoint                                          | Description            |
| ------- | ------------------------------------------------- | ---------------------- |
| POST    | `/api/certifications/demandes`                    | Demander certification |
| GET     | `/api/certifications/demandes`                    | Liste demandes         |
| GET     | `/api/certifications/demandes/:id`                | Détails demande        |
| POST    | `/api/certifications/inspections`                 | Créer inspection       |
| PUT     | `/api/certifications/inspections/:id`             | Résultats inspection   |
| POST    | `/api/certifications/demandes/:id/generate-badge` | Générer badge          |

---

### 15. Cloudinary ☁️

Gestion des fichiers et médias

| Méthode | Endpoint                 | Description          |
| ------- | ------------------------ | -------------------- |
| POST    | `/api/cloudinary/upload` | Uploader un fichier  |
| DELETE  | `/api/cloudinary/delete` | Supprimer un fichier |

---

### 16. Health Check ❤️

Vérification de l'état du service

| Méthode | Endpoint            | Description       |
| ------- | ------------------- | ----------------- |
| GET     | `/api/health`       | Statut de l'API   |
| GET     | `/api/health/ready` | Vérifie si prêt   |
| GET     | `/api/health/live`  | Vérifie si vivant |

---

## 🚀 Déploiement

### Backend (Render)

Le backend est déployé sur **Render** avec Docker.

**URL** : https://sencar-market.onrender.com

#### Variables d'environnement à configurer sur Render :

| Variable       | Description                       |
| -------------- | --------------------------------- |
| `DATABASE_URL` | Connection string PostgreSQL Neon |
| `JWT_SECRET`   | Clé secrète pour JWT              |
| `PORT`         | 3000                              |
| `NODE_ENV`     | production                        |

---

### Docker (Développement local)

```bash
# Builder et démarrer les services
docker-compose up --build

# Backend accessible sur : http://localhost:3000
# API Docs : http://localhost:3000/swagger

# Frontend accessible sur : http://localhost:8080
```

---

## 💻 Développement Local

### Prérequis

- Node.js 18+
- Docker (optionnel)

### Installation

```bash
# Installer les dépendances
cd Backend
npm install

# Copier les variables d'environnement
cp .env.example .env

# Configurer DATABASE_URL dans .env

# Générer Prisma Client
npm run prisma:generate

# Appliquer les migrations
npx prisma migrate deploy

# Démarrer en mode développement
npm run start:dev
```

---

## 🔧 Commandes Utiles

```bash
# Générer Prisma Client
npm run prisma:generate

# Appliquer les migrations
npx prisma migrate deploy

# Charger les données de seed
npm run prisma:seed

# Lancer les tests
npm run test

# Build production
npm run build
```

---

## 📝 Licence

Propriétaire - Tous droits réservés
