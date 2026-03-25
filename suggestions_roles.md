# Simplification des Rôles pour Sen-Car Market

## Ce que vous devriez garder (4 à 5 rôles principaux)

### 1. `UTILISATEUR` (Le Client Unique)
Fusionner "ACHETEUR", "VENDEUR" et "UTILISATEUR". 
* **Logique :** Sur Leboncoin ou Airbnb, un utilisateur est unique. Il peut chercher une voiture aujourd'hui et vendre la sienne demain. Pas besoin de changer de rôle dans la base de données.
* **Pouvoirs :** Acheter, Vendre (particulier), Louer, Évaluer, Signaler, Trade-In.

### 2. `PROFESSIONNEL` (Le B2B)
Fusionner "CONCESSIONNAIRE", "GARAGE", "PROPRIETAIRE_LOUEUR" et "COMPAGNIE_ASSURANCE".
* **Logique :** Regrouper tous ceux qui ont un **numéro de SIRET/NINEA** ou une boutique physique.
* **Pouvoirs :** Ajouter un catalogue complet, gérer des agences, souscrire à des abonnements Entreprise, afficher un badge "Pro".
* **Détail :** La spécialité (Assureur, Garagiste, Concessionnaire) deviendrait une *catégorie* de leur boutique, pas un rôle système.

### 3. `EXPERT` (Le Partenaire Terrain)
Remplacer "INSPECTEUR".
* **Logique :** Les mécaniciens ou experts engagés par Sen-Car pour certifier les véhicules et valider le Trade-In.

### 4. `ADMIN` (Le Gestionnaire)
Fusionner "ADMIN", "MODERATEUR" et "SUPER_ADMIN".
* **Logique :** Un back-office a généralement un seul rôle d'accès global. Les permissions (pouvoir supprimer un utilisateur vs pouvoir approuver un paiement) se gèrent dans le code, sans forcément multiplier les tables SQL.

## Pourquoi cette optimisation est meilleure ?
1. **Frontend plus simple :** Vous n'aurez que 4 types de tableaux de bord à designer (Dashboard Client, Dashboard Pro, App Expert, Back-Office Admin).
2. **Moins de bugs de sessions :** Vous n'aurez pas un "Acheteur" qui demande à devenir "Vendeur" (ce qui obligerait à déconnecter/reconnecter pour changer de token JWT).
