# 🚗 Sen-Car-Market

Sen-Car-Market est une plateforme en ligne moderne et complète dédiée à l'achat, la vente, la location, la reprise de véhicules, ainsi qu'aux services associés (assurances, certifications, et gestion pour les garages automobiles) au Sénégal. 

Ce dépôt contient le code source de la plateforme, composé d'un **Backend** robuste sous NestJS et d'un **Frontend** interactif développé avec Angular.

---

## 🌟 Fonctionnalités Principales

### 1. Gestion des Véhicules
*   **Annonces :** Création, recherche, filtrage et mise en avant d'annonces de véhicules.
*   **Médias :** Upload et gestion de photos de véhicules via **Cloudinary**.
*   **Locations :** Réservation et suivi des locations de voitures.
*   **Reprise (Trade-In) :** Estimation et gestion des demandes d'échange de véhicules.

### 2. Espace Professionnel (Garages & Concessionnaires)
*   **Création de Garages :** Enregistrement de garages avec géolocalisation et logo.
*   **Services Associés :** Mise en relation pour réparation, entretien, etc.

### 3. Services Complémentaires
*   **Assurances :** Souscription à des offres et options d'assurance automobile avec génération de contrat.
*   **Certifications :** Demandes d'inspection de véhicules, rapports d'état (PDF) et badges de certification.

### 4. Interactions & Paiements
*   **Messagerie :** Chat intégré en temps réel pour discuter entre acheteurs et vendeurs.
*   **Notifications :** Alertes par email et in-app (événements, statut d'annonce, paiements).
*   **Paiements :** Intégration des APIs Wave Pay et Orange Money (OM) pour le règlement d'abonnements et de services, avec gestion des commissions.

### 5. Administration & Back-Office
*   **Dashboard :** Suivi des métriques clés (utilisateurs, annonces, revenus).
*   **Modération :** Validation ou rejet des annonces, des garages et des demandes de reprise.

---

## 🛠 Architecture & Stack Technique

### Backend (`/Backend`)
*   **Framework :** NestJS (TypeScript)
*   **Base de données :** PostgreSQL (hébergé sur Neon)
*   **ORM :** Prisma
*   **Stockage de fichiers :** Cloudinary (gestion des images et PDFs)
*   **Cache & Tâches de fond :** Redis
*   **Authentification :** JWT et codes à usage unique (OTP)
e
### Frontend (`/Frontend`)
*   **Framework :** Angular (TypeScript)
*   **Styles :** CSS/SCSS modern
*   **Structure :** Architecture modulaire (Admin, Véhicules, Reprise, Auths, etc.)

---

## ⚙️ Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants :
*   [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée)
*   `npm` ou `yarn`
*   Une base de données PostgreSQL (locale ou distante)
*   Une instance Redis (locale ou distante)
*   Un compte Cloudinary (pour le stockage des médias)

---

## 🚀 Installation et Lancement (Environnement Local)

### 1. Configuration du Backend

```bash
cd Backend

# Installation des dépendances
npm install

# Copie du fichier d'environnement
cp .env.example .env
```

Éditez le fichier `.env` avec vos accès (Base de données, Redis, Cloudinary, etc.) :
```dotenv
DATABASE_URL=postgresql://user:password@localhost:5432/sencarmarket
REDIS_URL=redis://localhost:6379
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_SECRET=votre_api_secret
```

Lancez les migrations de base de données :
```bash
npx prisma migrate dev
```

Démarrez le serveur en mode développement :
```bash
npm run start:dev
```
Le backend sera accessible sur `http://localhost:8082`. L'API Swagger est généralement disponible sur `/api/docs`.

### 2. Configuration du Frontend

```bash
cd ../Frontend

# Installation des dépendances
npm install

# Optionnel : Vérifiez que l'URL locale pointe vers votre backend local 
# dans src/environments/environment.development.ts

# Démarrez le serveur Angular
npm start
```
L'application sera accessible depuis votre navigateur à l'adresse `http://localhost:4200`.

---

## 🌍 Déploiement

Le code est configuré pour être déployé facilement sur divers hébergeurs Cloud (Render, Vercel, Heroku, AWS).

### Déploiement Backend (Render)
*   **URL de Production :** `https://sencar-market.onrender.com`
*   Veillez à configurer toutes les variables d'environnement spécifiées dans `.env.example` au niveau du dashboard Render.

### Docker
Le projet dispose également d'un `Dockerfile` et d'un `docker-compose.yml` (à la racine) pour conteneuriser l'application rapidement.

```bash
# Lancer les conteneurs (Postgres, Redis, Backend, etc. selon configuration)
docker-compose up -d
```

---

## 👨‍💻 Structure du Projet

```text
Sen-Car-Market/
├── Backend/                 # API NestJS
│   ├── prisma/              # Schémas et migrations de base de données
│   ├── src/
│   │   ├── common/          # Utilitaires, intercepteurs, exceptions
│   │   ├── modules/         # Modules du domaine (Vehicule, Assurance, Cloudinary...)
│   │   └── main.ts          # Point d'entrée Backend
│   └── package.json
│
├── Frontend/                # Agular SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/        # Services centraux, guards, intercepteurs HTTP
│   │   │   ├── features/    # Composants des différentes pages (Admin, Trade-In...)
│   │   │   └── shared/      # Composants/Pipes partagés
│   │   ├── environments/    # Configurations environnementales
│   │   └── main.ts          # Point d'entrée Frontend
│   └── package.json
│
├── docker-compose.yml       # Configuration globale Docker
└── README.md                # Ce fichier
```
