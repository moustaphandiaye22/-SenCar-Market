# 📐 Diagrammes de Cas d'Utilisation — Sen-Car-Market

## 📁 Fichiers disponibles

| Fichier | Acteur | Description |
|---------|--------|-------------|
| `UC00_Vue_Globale.puml` | Tous | Vue synthétique de tous les acteurs |
| `UC01_Visiteur.puml` | Visiteur | Navigation publique, inscription |
| `UC02_Utilisateur.puml` | UTILISATEUR | Particulier inscrit (complet) |
| `UC03_Professionnel.puml` | PROFESSIONNEL | Garage / concessionnaire |
| `UC04_Expert.puml` | EXPERT | Inspecteur de véhicules |
| `UC05_Admin.puml` | ADMIN | Administrateur plateforme |

---

## 🚀 Rendu avec StarUML

### Option 1 — Plugin PlantUML dans StarUML
1. Ouvrir StarUML
2. Menu **Tools → Extension Manager**
3. Installer le plugin **PlantUML**
4. Clic droit sur le projet → **Import PlantUML** → sélectionner un fichier `.puml`

### Option 2 — Rendu en ligne rapide
1. Aller sur [https://www.plantuml.com/plantuml/uml](https://www.plantuml.com/plantuml/uml)
2. Coller le contenu d'un fichier `.puml`
3. Télécharger le PNG/SVG pour l'intégrer dans le mémoire

### Option 3 — VS Code (recommandé)
1. Installer l'extension **PlantUML** (par jebbs)
2. Ouvrir un fichier `.puml`
3. `Alt+D` pour prévisualiser
4. Clic droit → **Export Current Diagram** → PNG ou SVG

---

## 📊 Hiérarchie des acteurs

```
Visiteur
  └── UTILISATEUR (hérite de Visiteur)
        └── PROFESSIONNEL (hérite de UTILISATEUR)
EXPERT    (rôle spécialisé indépendant)
ADMIN     (accès total à la plateforme)
```

---

## 🔗 Relations UML utilisées

| Relation | Signification |
|----------|---------------|
| `<<include>>` | Le cas inclus est **obligatoire** à chaque exécution |
| `<<extend>>` | Le cas étendu s'exécute de façon **optionnelle ou conditionnelle** |
| `-up-\|>` | **Héritage** entre acteurs (généralisation) |

---

## Modules couverts

- 🔐 Authentification (JWT, OTP, refresh token)
- 🚘 Annonces Véhicules (CRUD, favoris, boost)
- 🔑 Location (annonces, réservations, disponibilités)
- 💬 Messagerie (conversations, messages, temps réel)
- ⭐ Avis & Notes (véhicule, garage, utilisateur)
- 🔄 Trade-In / Reprise (estimation, validation)
- 🏅 Certification Véhicule (inspection, rapport, badge)
- 🛡️ Assurance (produits, options, souscription, contrat)
- 📦 Abonnements & Boosts
- 💳 Paiement & Transactions
- ⚙️ Administration (modération, stats, notifications)
