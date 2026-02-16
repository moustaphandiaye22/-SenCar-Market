package com.sencarmarket.module.certification.service;

import com.sencarmarket.module.certification.entity.DemandeCertification;
import com.sencarmarket.module.certification.entity.Inspection;
import com.sencarmarket.module.certification.entity.RapportInspection;

import java.util.List;
import java.util.UUID;

/**
 * Interface pour le service certification
 * Implémente le principe de DIP (Dependency Inversion Principle)
 */
public interface ICertificationService {

    // Demande Certification
    DemandeCertification createDemande(DemandeCertification demande);

    DemandeCertification updateStatutDemande(UUID id, String nouveauStatut);

    void deleteDemande(UUID id);

    DemandeCertification getDemandeById(UUID id);

    List<DemandeCertification> getAllDemandes();

    List<DemandeCertification> getDemandesByUtilisateur(UUID utilisateurId);

    List<DemandeCertification> getDemandesEnAttente();

    // Inspection
    Inspection createInspection(Inspection inspection);

    Inspection updateInspection(UUID id, Inspection inspection);

    Inspection getInspectionById(UUID id);

    List<Inspection> getInspectionsByDemande(UUID demandeId);

    // Rapport
    RapportInspection createRapport(RapportInspection rapport);

    RapportInspection getRapportById(UUID id);

    RapportInspection getRapportByInspection(UUID inspectionId);
}
