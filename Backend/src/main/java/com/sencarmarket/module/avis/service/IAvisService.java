package com.sencarmarket.module.avis.service;

import com.sencarmarket.module.avis.entity.Avis;

import java.util.List;
import java.util.UUID;

/**
 * Interface pour le service avis
 * Implémente le principe de DIP (Dependency Inversion Principle)
 */
public interface IAvisService {

    Avis createAvis(Avis avis);

    Avis updateAvis(UUID id, Avis avis);

    void deleteAvis(UUID id);

    Avis getAvisById(UUID id);

    List<Avis> getAllAvis();

    List<Avis> getAvisByUtilisateur(UUID utilisateurId);

    List<Avis> getAvisByVehicule(UUID vehiculeId);

    double getNoteMoyenneByVehicule(UUID vehiculeId);

    List<Avis> getAvisByGarage(UUID garageId);
}
