# Sen-Car Market Backend (NestJS)

Migration progressive du backend Spring Boot vers NestJS, module par module.

## Objectifs
- Garder la continuité de service pendant la migration.
- Conserver les contrats API existants.
- Aligner le code sur les bonnes pratiques NestJS (modularité, validation, sécurité, tests).

## Modules migrés
1. `auth` (version initiale)
  - `POST /api/auth/register`
  - `POST /api/auth/verify-otp`
  - `POST /api/auth/resend-otp`
  - `POST /api/auth/login`
  - `POST /api/auth/refresh`
  - `GET /api/auth/me`
  - `PUT /api/auth/profile`
  - `POST /api/auth/change-password`
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/reset-password`
2. `vehicule` (version initiale)
  - `POST /api/vehicules`
  - `GET /api/vehicules`
  - `GET /api/vehicules/:id`
  - `GET /api/vehicules/moi`
  - `PUT /api/vehicules/:id/publish`
  - `DELETE /api/vehicules/:id`
  - `POST /api/vehicules/:id/favoris`
  - `DELETE /api/vehicules/:id/favoris`
  - `GET /api/vehicules/favoris/moi`
  - `POST /api/vehicules/:id/boost?debut=...&fin=...`
3. `location` (version initiale)
  - `POST /api/locations/annonces`
  - `PUT /api/locations/annonces/:id`
  - `DELETE /api/locations/annonces/:id`
  - `GET /api/locations/annonces`
  - `GET /api/locations/annonces/:id`
  - `POST /api/locations/reservations`
4. `paiement` (version initiale)
  - `POST /api/paiements`
  - `POST /api/paiements/wave`
  - `POST /api/paiements/orange-money`
  - `POST /api/paiements/escrow`
  - `GET /api/paiements/:id`
  - `GET /api/paiements/utilisateur/:utilisateurId`
  - `GET /api/paiements/reservation/:reservationId`
  - `POST /api/paiements/portefeuille/crediter`
  - `POST /api/paiements/portefeuille/debiter`
  - `GET /api/paiements/transactions/:id`
5. `abonnement` (version initiale)
  - `POST /api/abonnements/plans`
  - `GET /api/abonnements/plans`
  - `POST /api/abonnements/souscription`
  - `GET /api/abonnements/utilisateurs/:utilisateurId/actif`
  - `POST /api/abonnements/boosts`
6. `notification` (version initiale)
  - `GET /api/notifications/utilisateur/:utilisateurId`
  - `PUT /api/notifications/:id/read`
  - `GET /api/signalements`
  - `POST /api/signalements`
  - `POST /api/signalements/:id/traiter`
7. `messagerie` (version initiale)
  - `POST /api/messagerie/conversations`
  - `GET /api/messagerie/conversations`
  - `POST /api/messagerie/messages`
  - `GET /api/messagerie/conversations/:conversationId/messages`
  - `POST /api/messagerie/conversations/:conversationId/leave`
8. `admin` (version initiale)
  - `GET /api/admin/dashboard/stats`
  - `GET /api/admin/utilisateurs`
  - `PUT /api/admin/utilisateurs/:utilisateurId/role`
  - `GET /api/admin/annonces`
  - `GET /api/admin/transactions`
9. `avis` (version initiale)
  - `POST /api/avis`
  - `GET /api/avis/:avisId`
  - `GET /api/avis/utilisateur/:utilisateurId`
  - `GET /api/avis/vehicule/:vehiculeId`
  - `GET /api/avis/garage/:garageId`
  - `GET /api/avis/utilisateur/:utilisateurId/moyenne`
  - `GET /api/avis/vehicule/:vehiculeId/moyenne`
  - `GET /api/avis/garage/:garageId/moyenne`
  - `POST /api/avis/:avisId/signaler`
  - `DELETE /api/avis/:avisId`
  - `GET /api/avis/transaction/:transactionId/validation`
10. `garage` (version initiale)
  - `POST /api/garages`
  - `GET /api/garages`
  - `GET /api/garages/actifs`
  - `GET /api/garages/en-attente`
  - `GET /api/garages/proprietaire/:proprietaireId`
  - `GET /api/garages/search/ville?ville=...`
  - `GET /api/garages/search/proximity?latitude=...&longitude=...&rayonKm=...`
  - `GET /api/garages/search?q=...`
  - `GET /api/garages/:id`
  - `PUT /api/garages/:id`
  - `DELETE /api/garages/:id`
  - `POST /api/garages/:id/validate`
  - `PUT /api/garages/:id/logo`
  - `POST /api/garages/services`
  - `GET /api/garages/services`
  - `GET /api/garages/services/:id`
  - `POST /api/garages/:garageId/services`
  - `GET /api/garages/:garageId/services`
  - `DELETE /api/garages/:garageId/services/:serviceId`
11. `assurance` (version initiale)
  - `POST /api/assurances/produits`
  - `GET /api/assurances/produits/:id`
  - `GET /api/assurances/produits`
  - `GET /api/assurances/produits/actifs`
  - `PUT /api/assurances/produits/:id`
  - `DELETE /api/assurances/produits/:id`
  - `POST /api/assurances/options`
  - `GET /api/assurances/options/:id`
  - `GET /api/assurances/produits/:produitId/options`
  - `PUT /api/assurances/options/:id`
  - `DELETE /api/assurances/options/:id`
  - `POST /api/assurances/souscriptions`
  - `GET /api/assurances/souscriptions/:id`
  - `GET /api/assurances/souscriptions/utilisateur/:utilisateurId`
  - `GET /api/assurances/calcul-prix`
  - `POST /api/assurances/souscriptions/:id/payment`
  - `POST /api/assurances/souscriptions/:id/contrat`
  - `POST /api/assurances/souscriptions/:id/documents`
12. `tradein` (version initiale)
  - `POST /api/tradein/demandes`
  - `GET /api/tradein/demandes`
  - `GET /api/tradein/demandes/non-notifiees`
  - `GET /api/tradein/demandes/:id`
  - `GET /api/tradein/demandes/utilisateur/:utilisateurId`
  - `PUT /api/tradein/demandes/:id`
  - `DELETE /api/tradein/demandes/:id`
  - `POST /api/tradein/estimation`
  - `POST /api/tradein/demandes/:id/calculer-estimation`
  - `POST /api/tradein/demandes/:id/validation`
  - `PATCH /api/tradein/demandes/:id/statut`
  - `POST /api/tradein/demandes/:id/notifier`
13. `certification` (version initiale)
  - `POST /api/certifications/demandes`
  - `GET /api/certifications/demandes`
  - `GET /api/certifications/demandes/:id`
  - `GET /api/certifications/demandes/utilisateur/:utilisateurId`
  - `PUT /api/certifications/demandes/:id`
  - `DELETE /api/certifications/demandes/:id`
  - `POST /api/certifications/demandes/:demandeId/payment`
  - `POST /api/certifications/demandes/:demandeId/assign-inspector`
  - `PATCH /api/certifications/demandes/:demandeId/statut`
  - `POST /api/certifications/inspections`
  - `GET /api/certifications/inspections/:id`
  - `GET /api/certifications/inspections/inspecteur/:inspecteurId`
  - `PUT /api/certifications/inspections/:id`
  - `DELETE /api/certifications/inspections/:id`
  - `POST /api/certifications/inspections/:inspectionId/upload-rapport`
  - `POST /api/certifications/inspections/:inspectionId/resultat`
  - `POST /api/certifications/demandes/:demandeId/generate-badge`

## Lancer le projet
1. Copier les variables d'environnement
```bash
cp .env.example .env
```
2. Installer les dépendances
```bash
npm install
```
3. Générer Prisma Client
```bash
npm run prisma:generate
```
4. Appliquer les migrations
```bash
npx prisma migrate deploy
```
5. (Optionnel) Charger les données de démonstration
```bash
npm run prisma:seed
```
6. Démarrer en dev
```bash
npm run start:dev
```

## Base de données Neon (serverless)
- Utiliser uniquement l'URL de connexion dans `DATABASE_URL` (format `postgresql://...`).
- Ne pas inclure le préfixe `psql '...'` dans `.env`.

## Stratégie de migration module par module
1. Auth + utilisateur (alignement HTTP + compat JWT legacy Spring fait)
2. Véhicule (alignement HTTP principal fait)
3. Location/annonce (fait)
4. Paiement (fait)
5. Abonnement (fait)
6. Notification/signalement (fait)
7. Messagerie (fait)
8. Admin (fait)
9. Avis (fait)
10. Garage (fait)
11. Assurance (fait)
12. TradeIn (fait)
13. Certification (fait)
14. Modules restants

## Principes de qualité
- DTO validés (`class-validator`) à toutes les entrées.
- Exceptions métier normalisées.
- Accès DB encapsulé dans repository.
- Gardes JWT centralisées.
- Tests unitaires sur cas critiques.
