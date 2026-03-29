# 🚗 Sen-Car-Market - Frontend Angular

> Application Frontend de la plateforme Sen-Car-Market developpee avec Angular 17.

[![Angular](https://img.shields.io/badge/Angular-17-red)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-cyan)](https://tailwindcss.com/)

---

## 🌐 URLs de l'Application

| Environnement                   | URL                                        |
| ------------------------------- | ------------------------------------------ |
| **Frontend (Production)**       | https://sencar-market.vercel.app           |
| **Backend API**                 | https://sencar-market.onrender.com         |
| **API Documentation (Swagger)** | https://sencar-market.onrender.com/swagger |

---

## 🏗️ Architecture du Projet

```
Frontend/
├── src/
│   ├── app/
│   │   ├── core/                    # Services centraux, guards, interceptors
│   │   │   ├── components/          # Composants partages (header, footer, dialogs)
│   │   │   ├── guards/              # Guards d'authentification
│   │   │   ├── interceptors/        # Interceptors HTTP (auth, error)
│   │   │   ├── services/            # Services (API, Auth, etc.)
│   │   │   └── models/              # Interfaces et types
│   │   │
│   │   ├── features/                # Modules fonctionnels
│   │   │   ├── admin/               # Interface d'administration
│   │   │   ├── auth/                # Authentification (login, register)
│   │   │   ├── dashboard/           # Tableau de bord utilisateur
│   │   │   ├── vehicles/            # Gestion des vehicules
│   │   │   ├── garages/             # Gestion des garages
│   │   │   ├── assurance/           # Assurances et souscriptions
│   │   │   ├── rentals/             # Locations de vehicules
│   │   │   ├── trade-in/            # Reprise de vehicules
│   │   │   ├── certification/       # Certifications vehicules
│   │   │   ├── paiement/            # Paiements et transactions
│   │   │   ├── messagerie/          # Messagerie temps reel
│   │   │   ├── avis/                # Avis et evaluations
│   │   │   ├── abonnements/         # Abonnements premium
│   │   │   └── home/                # Page d'accueil
│   │   │
│   │   ├── shared/                  # Composants, pipes, directives partages
│   │   ├── app.component.ts         # Composant racine
│   │   ├── app.config.ts            # Configuration de l'application
│   │   └── app.routes.ts            # Definition des routes
│   │
│   ├── environments/                # Configurations environnementales
│   │   ├── environment.development.ts
│   │   └── environment.ts
│   │
│   ├── assets/                      # Images, polices, fichiers statiques
│   └── styles.scss                  # Styles globaux
│
├── angular.json                     # Configuration Angular CLI
├── tailwind.config.js               # Configuration Tailwind CSS
├── package.json                     # Dependances npm
└── Dockerfile                       # Container Docker
```

---

## 🛠️ Stack Technique

| Categorie     | Technologie                        |
| ------------- | ---------------------------------- |
| **Framework** | Angular 17 (Standalone Components) |
| **Language**  | TypeScript 5.2                     |
| **Styles**    | SCSS + TailwindCSS 3.0             |
| **HTTP**      | HttpClient avec Interceptors       |
| **State**     | Services avec BehaviorSubject      |
| **Routing**   | Angular Router (lazy loading)      |
| **Forms**     | Reactive Forms                     |
| **UI**        | Composants personnalises           |
| **Build**     | Vercel / Docker                    |

---

## 📱 Modules Fonctionnels

### 1. Authentification 🔐

- Page de connexion
- Inscription utilisateur
- Mot de passe oublie
- Verification OTP

### 2. Dashboard Utilisateur 📊

- Profil utilisateur
- Mes vehicules
- Mes favoris
- Mes reservations

### 3. Vehicules 🚗

- Liste des annonces
- Recherche et filtres
- Details vehicule
- Ajout aux favoris

### 4. Garages 🔧

- Liste des garages
- Recherche par ville
- Details garage
- Services associes

### 5. Assurances 📋

- Produits d'assurance
- Souscription en ligne
- Gestion des contrats

### 6. Locations 🚙

- Annonces de location
- Reservation de vehicules
- Suivi des locations

### 7. Trade-In 🔄

- Demande de reprise
- Estimation de valeur
- Suivi des demandes

### 8. Certifications ✅

- Demande de certification
- Suivi inspection
- Generation de badge

### 9. Paiements 💳

- Integration Wave
- Integration Orange Money
- Portefeuille virtuel

### 10. Messagerie 💬

- Conversations temps reel
- Messages entre utilisateurs

### 11. Avis et Notes ⭐

- Deposer un avis
- Evaluations vehicules/garages

### 12. Abonnements ⭐

- Plans premium
- Boosts d'annonces

### 13. Administration 👨‍💼

- Dashboard admin
- Gestion utilisateurs
- Moderation annonces
- Statistiques

---

## 🚀 Installation et Lancement

### Prérequis

- Node.js 18+
- npm ou yarn

### Installation

```bash
# Cloner le projet
git clone https://github.com/votre-repo/Sen-Car-Market.git

# Aller dans le dossier Frontend
cd Frontend

# Installer les dépendances
npm install
```

### Configuration

Modifier le fichier `src/environments/environment.development.ts` :

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:8082/api",
  waveApiKey: "votre_cle_wave",
  orangeMoneyApiKey: "votre_cle_om",
};
```

### Lancement

```bash
# Mode développement
npm start
# Accessible sur http://localhost:4200

# Mode production
npm run build
# Les fichiers seront dans dist/
```

---

## 🐳 Docker

```bash
# Construire l'image
docker build -t sencarmarket-frontend .

# Lancer le conteneur
docker run -p 8080:80 sencarmarket-frontend
```

---

## 🧪 Tests

```bash
# Lancer les tests unitaires
ng test

# Lancer les tests e2e
ng e2e
```

---

## 📁 Structure des Services

### Services Core

| Service                                                                  | Description                 |
| ------------------------------------------------------------------------ | --------------------------- |
| [`api.service.ts`](src/app/core/services/api.service.ts)                 | Service HTTP principal      |
| [`auth.service.ts`](src/app/core/services/auth.service.ts)               | Gestion authentification    |
| [`error.interceptor.ts`](src/app/core/interceptors/error.interceptor.ts) | Intercepteur d'erreurs HTTP |

### Guards

| Guard            | Description                         |
| ---------------- | ----------------------------------- |
| `auth.guard.ts`  | Protection des routes authentifiees |
| `admin.guard.ts` | Protection des routes admin         |

---

## 🔧 Commandes Utiles

```bash
# Generer un nouveau composant
ng generate component features/vehicles/vehicle-list

# Generer un nouveau service
ng generate service core/services/mon-service

# Generer un nouveau module
ng generate module features/mon-module

# Lancer le build production
npm run build

# Lancer le serveur avec proxy
npm start -- --proxy-config proxy.conf.json
```

---

## 📝 Variables d'Environnement

| Variable          | Description               | Defaut                    |
| ----------------- | ------------------------- | ------------------------- |
| `API_URL`         | URL de l'API Backend      | http://localhost:8082/api |
| `WAVE_PUBLIC_KEY` | Cle publique Wave         | -                         |
| `OM_PUBLIC_KEY`   | Cle publique Orange Money | -                         |

---

## 🔗 Integration avec le Backend

Le Frontend communique avec le Backend via des appels REST :

- **Base URL** : Configuree dans `environment.ts`
- **Authentification** : JWT token dans le header `Authorization`
- **Format** : JSON

Exemple d'appel API :

```typescript
this.http.get(`${environment.apiUrl}/vehicules`).subscribe((vehicules) => console.log(vehicules));
```

---

## 🚢 Déploiement

### Vercel (Recommande)

1. Connecter le depot GitHub a Vercel
2. Configurer :
   - Framework Preset : Angular
   - Root Directory : Frontend (Paramètre crucial)
   - Build Command : npm run build
   - Output Directory : dist/sen-car-market/browser (Vérifiez bien ce chemin)
3. Deployer

### Docker

```bash
# Build
docker build -t sencarmarket-frontend .

# Run
docker run -d -p 8080:80 sencarmarket-frontend
```

---

## 📄 Licence

Proprietaire - Tous droits reserves
